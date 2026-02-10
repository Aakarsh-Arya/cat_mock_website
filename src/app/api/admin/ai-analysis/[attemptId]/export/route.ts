/**
 * @fileoverview Admin AI Analysis Export API Endpoint
 * @description Admin-only endpoint to download the Composite Context JSON for an attempt.
 *   After successful export, marks the attempt as "exported" in the lifecycle.
 * @route GET /api/admin/ai-analysis/[attemptId]/export
 * @blueprint AI Analysis Export — Phase 3 (docs/AI_ANALYSIS_EXPORT.md)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import { generateCompositeContextPacket } from '@/lib/analysis/generateCompositeContextPacket';

// ─── Auth helpers (mirrored from paper export route) ─────────────────────────

async function createActionClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
    const cookieStore = await cookies();

    return createServerClient(url, anon, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Ignore — cookies can't be set during render
                }
            },
        },
    });
}

async function verifyAdmin(): Promise<{ userId: string; email: string }> {
    const supabase = await createActionClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            return verifyAdminRole(supabase, session);
        }
        throw new Error('Not authenticated');
    }

    const { data: { session } } = await supabase.auth.getSession();
    return verifyAdminRole(supabase, session);
}

async function verifyAdminRole(
    supabase: ReturnType<typeof createServerClient>,
    session: { user: { id: string; email?: string }; access_token?: string } | null
): Promise<{ userId: string; email: string }> {
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true' && process.env.NODE_ENV !== 'production';
    if (!skipAdminCheck) {
        let role: string | null = (session.user as { app_metadata?: { user_role?: string } }).app_metadata?.user_role ?? null;

        if (!role && session.access_token) {
            try {
                const payload = JSON.parse(
                    Buffer.from(session.access_token.split('.')[1], 'base64').toString('utf-8')
                ) as { user_role?: string; app_metadata?: { user_role?: string } };
                role = payload.user_role ?? payload.app_metadata?.user_role ?? null;
            } catch {
                role = null;
            }
        }

        if (role !== 'admin' && role !== 'dev') {
            const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
            if (rpcError || !isAdmin) {
                throw new Error('Unauthorized: Admin access required');
            }
        }
    }

    return { userId: session.user.id, email: session.user.email || '' };
}

// ─── GET handler ─────────────────────────────────────────────────────────────

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ attemptId: string }> }
) {
    const admin = getServiceRoleClient();
    let attemptId: string;

    try {
        await verifyAdmin();
        attemptId = (await params).attemptId;

        if (!attemptId) {
            return NextResponse.json({ error: 'Attempt ID required' }, { status: 400 });
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message.includes('Not authenticated') || message.includes('Unauthorized')) {
            return NextResponse.json({ error: message }, { status: 401 });
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }

    try {
        // Generate the composite context packet
        const { data: packet, error: genError, validationWarnings } = await generateCompositeContextPacket(attemptId);

        if (genError || !packet) {
            // Mark as failed
            await admin
                .from('attempts')
                .update({
                    ai_analysis_status: 'failed',
                    ai_analysis_error: genError ?? 'Unknown generation error',
                })
                .eq('id', attemptId);

            return NextResponse.json({ error: genError ?? 'Failed to generate context packet' }, { status: 500 });
        }

        // Log validation warnings if any (non-fatal — still export)
        if (validationWarnings && validationWarnings.length > 0) {
            console.warn(`[AI Analysis Export] ${validationWarnings.length} schema validation warning(s) for attempt ${attemptId}:`, validationWarnings);
        }

        const { data: currentAttempt } = await admin
            .from('attempts')
            .select('ai_analysis_status')
            .eq('id', attemptId)
            .maybeSingle();

        const nextStatus = currentAttempt?.ai_analysis_status === 'processed'
            ? 'processed'
            : 'exported';

        // Mark as exported (unless already processed with admin-pasted insight)
        await admin
            .from('attempts')
            .update({
                ai_analysis_status: nextStatus,
                ai_analysis_exported_at: new Date().toISOString(),
                ai_analysis_error: validationWarnings?.length
                    ? `Schema warnings: ${validationWarnings.join('; ')}`
                    : null,
            })
            .eq('id', attemptId);

        // Build filename
        const slug = (packet.paper as Record<string, unknown>).slug || (packet.paper as Record<string, unknown>).id || packet.meta.paper_id;
        const filename = `analysis_${slug}_${attemptId.slice(0, 8)}.json`;

        const jsonString = JSON.stringify(packet, null, 2);

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('AI Analysis export error:', message);

        // Mark as failed
        await admin
            .from('attempts')
            .update({
                ai_analysis_status: 'failed',
                ai_analysis_error: message,
            })
            .eq('id', attemptId);

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
