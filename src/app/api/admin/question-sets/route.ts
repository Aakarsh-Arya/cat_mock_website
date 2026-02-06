/**
 * @fileoverview Question Sets API Route
 * @description CRUD operations for question sets
 * @blueprint Question Container Architecture
 */

import { NextRequest, NextResponse } from 'next/server';
import { sbSSR } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const CONTEXT_TYPE_VALUES = new Set([
    'rc_passage',
    'dilr_set',
    'caselet',
    'data_table',
    'graph',
    'other_shared_stimulus',
]);

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Admin API requires service role access.');
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

async function verifyAdmin() {
    const supabase = await sbSSR();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('Unauthorized');
    }

    // SKIP_ADMIN_CHECK only allowed in non-production environments
    const skipAdminCheck = process.env.SKIP_ADMIN_CHECK === 'true' && process.env.NODE_ENV !== 'production';
    if (!skipAdminCheck) {
        const { data: { session } } = await supabase.auth.getSession();
        let role: string | null = session?.user?.app_metadata?.user_role ?? null;

        if (!role && session?.access_token) {
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
                throw new Error('Unauthorized');
            }
        }
    }

    return user;
}

export async function POST(request: NextRequest) {
    try {
        await verifyAdmin();
        const adminClient = getAdminClient();

        const body = await request.json();
        const {
            paper_id,
            section,
            set_type,
            content_layout,
            context_title,
            context_body,
            context_image_url,
            context_type,
            questions,
        } = body;

        // Validate required fields
        if (!paper_id || !section || !set_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get next display_order for this section
        const { data: existingSets } = await adminClient
            .from('question_sets')
            .select('display_order')
            .eq('paper_id', paper_id)
            .eq('section', section)
            .order('display_order', { ascending: false })
            .limit(1);

        const nextDisplayOrder = (existingSets?.[0]?.display_order ?? 0) + 1;

        if (context_type && !CONTEXT_TYPE_VALUES.has(context_type)) {
            return NextResponse.json({ error: 'Invalid context_type' }, { status: 400 });
        }

        // Create the question set
        const { data: questionSet, error: setError } = await adminClient
            .from('question_sets')
            .insert({
                paper_id,
                section,
                set_type,
                content_layout: content_layout || 'single_focus',
                context_title: context_title || null,
                context_body: context_body || null,
                context_image_url: context_image_url || null,
                context_type: context_type || null,
                display_order: nextDisplayOrder,
                is_active: true,
                is_published: false,
            })
            .select()
            .single();

        if (setError) {
            console.error('Error creating question set:', setError);
            return NextResponse.json({ error: setError.message }, { status: 500 });
        }

        // Create questions if provided
        if (questions && questions.length > 0) {
            // Get next question_number for this paper/section
            const { data: existingQuestions } = await adminClient
                .from('questions')
                .select('question_number')
                .eq('paper_id', paper_id)
                .eq('section', section)
                .order('question_number', { ascending: false })
                .limit(1);

            let nextQuestionNumber = (existingQuestions?.[0]?.question_number ?? 0) + 1;

            const questionsToInsert = questions.map((q: {
                question_text: string;
                question_type: string;
                options?: string[];
                correct_answer: string;
                positive_marks?: number;
                negative_marks?: number;
                sequence_order?: number;
                difficulty?: string;
                topic?: string;
            }, index: number) => ({
                paper_id,
                section,
                set_id: questionSet.id,
                question_number: nextQuestionNumber + index,
                sequence_order: q.sequence_order || index + 1,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.question_type === 'MCQ' ? q.options : null,
                correct_answer: q.correct_answer,
                positive_marks: q.positive_marks ?? 3,
                negative_marks: q.negative_marks ?? (q.question_type === 'TITA' ? 0 : 1),
                difficulty: q.difficulty || null,
                topic: q.topic || null,
                is_active: true,
            }));

            const { error: questionsError } = await adminClient
                .from('questions')
                .insert(questionsToInsert);

            if (questionsError) {
                console.error('Error creating questions:', questionsError);
                // Rollback: delete the question set
                await adminClient.from('question_sets').delete().eq('id', questionSet.id);
                return NextResponse.json({ error: questionsError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, data: questionSet });
    } catch (error) {
        console.error('Question sets API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await verifyAdmin();

        const adminClient = getAdminClient();

        const { searchParams } = new URL(request.url);
        const paperId = searchParams.get('paper_id');

        let query = adminClient
            .from('question_sets')
            .select('*, questions(*)')
            .order('display_order', { ascending: true });

        if (paperId) {
            query = query.eq('paper_id', paperId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching question sets:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Question sets API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
