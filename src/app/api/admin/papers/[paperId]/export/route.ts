/**
 * @fileoverview Paper Export API Endpoint
 * @description Admin-only endpoint to export paper JSON from Supabase
 * @route GET /api/admin/papers/[paperId]/export
 * 
 * Query Parameters:
 *   - run: (optional) specific ingest_run_id to export
 *   - version: (optional) specific version number to export
 *   - assembled: (optional) force assembly from current DB state
 *   - format: (optional) 'v3' for Schema v3.0 sets-first format (default: v1)
 * 
 * Response: JSON file download with paper data matching CONTENT-SCHEMA.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Create admin client with service role key (bypasses RLS)
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations require service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Create SSR client for auth verification
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
                    // Ignore - cookies can't be set in server actions during render
                }
            },
        },
    });
}

// Verify the user is authenticated and is an admin
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

async function verifyAdminRole(supabase: ReturnType<typeof createServerClient>, session: { user: { id: string; email?: string }; access_token?: string } | null): Promise<{ userId: string; email: string }> {
    if (!session?.user) {
        throw new Error('Not authenticated');
    }

    const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true' && process.env.NODE_ENV !== 'production';
    if (!skipAdminCheck) {
        let role: string | null = (session.user as { app_metadata?: { user_role?: string } }).app_metadata?.user_role ?? null;

        if (!role && session.access_token) {
            try {
                const payload = JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString('utf-8')) as {
                    user_role?: string;
                    app_metadata?: { user_role?: string };
                };
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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ paperId: string }> }
) {
    try {
        // Verify admin access
        await verifyAdmin();

        const { paperId } = await params;
        if (!paperId) {
            return NextResponse.json({ error: 'Paper ID required' }, { status: 400 });
        }

        const adminClient = getAdminClient();
        const { searchParams } = new URL(req.url);

        // Get export options
        const runId = searchParams.get('run');
        const version = searchParams.get('version');
        const forceAssemble = searchParams.get('assembled') === 'true';
        const formatV3 = searchParams.get('format') === 'v3';

        let exportData: unknown;
        let filename: string;

        // V3 format export (sets-first) - for content creation context
        if (formatV3) {
            const { data, error } = await adminClient.rpc('export_paper_json_v3', {
                p_paper_id: paperId
            });

            if (error) {
                console.error('Export V3 RPC error:', error);
                // Fallback message if function doesn't exist yet
                if (error.message.includes('does not exist')) {
                    return NextResponse.json({
                        error: 'V3 export function not available. Apply migration 008 first.'
                    }, { status: 500 });
                }
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            exportData = data;

            // Get paper slug for filename
            const { data: paperData } = await adminClient
                .from('papers')
                .select('slug')
                .eq('id', paperId)
                .single();

            const slug = paperData?.slug || paperId;
            filename = `${slug}_v3.json`;
        } else if (forceAssemble) {
            // Force assembly from current database state
            const { data, error } = await adminClient.rpc('export_paper_json', {
                p_paper_id: paperId
            });

            if (error) {
                console.error('Export RPC error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            exportData = data;
            filename = `paper_${paperId}_assembled.json`;
        } else if (runId) {
            // Export specific ingest run
            const { data, error } = await adminClient.rpc('export_paper_json_versioned', {
                p_paper_id: paperId,
                p_ingest_run_id: runId
            });

            if (error) {
                console.error('Export RPC error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            exportData = data;
            filename = `paper_${paperId}_run_${runId}.json`;
        } else if (version) {
            // Export specific version number
            const { data: runData, error: runError } = await adminClient
                .from('paper_ingest_runs')
                .select('id')
                .eq('paper_id', paperId)
                .eq('version_number', parseInt(version, 10))
                .single();

            if (runError || !runData) {
                return NextResponse.json({ error: `Version ${version} not found` }, { status: 404 });
            }

            const { data, error } = await adminClient.rpc('export_paper_json_versioned', {
                p_paper_id: paperId,
                p_ingest_run_id: runData.id
            });

            if (error) {
                console.error('Export RPC error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            exportData = data;
            filename = `paper_${paperId}_v${version}.json`;
        } else {
            // Default: use versioned export (prefers canonical snapshot)
            const { data, error } = await adminClient.rpc('export_paper_json_versioned', {
                p_paper_id: paperId,
                p_ingest_run_id: null
            });

            if (error) {
                console.error('Export RPC error:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            exportData = data;

            // Get paper slug for filename
            const { data: paperData } = await adminClient
                .from('papers')
                .select('slug')
                .eq('id', paperId)
                .single();

            const slug = paperData?.slug || paperId;
            filename = `${slug}.json`;
        }

        // Check for errors in the response
        if (exportData && typeof exportData === 'object' && 'error' in exportData) {
            return NextResponse.json(exportData, { status: 404 });
        }

        // Return as downloadable JSON file
        const jsonString = JSON.stringify(exportData, null, 2);

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
        console.error('Export error:', message);

        if (message.includes('Not authenticated') || message.includes('Unauthorized')) {
            return NextResponse.json({ error: message }, { status: 401 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
