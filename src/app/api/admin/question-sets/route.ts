/**
 * @fileoverview Question Sets API Route
 * @description CRUD operations for question sets
 * @blueprint Question Container Architecture
 */

import { NextRequest, NextResponse } from 'next/server';
import { sbSSR } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await sbSSR();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            paper_id,
            section,
            set_type,
            content_layout,
            context_title,
            context_body,
            context_image_url,
            questions,
        } = body;

        // Validate required fields
        if (!paper_id || !section || !set_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get next display_order for this section
        const { data: existingSets } = await supabase
            .from('question_sets')
            .select('display_order')
            .eq('paper_id', paper_id)
            .eq('section', section)
            .order('display_order', { ascending: false })
            .limit(1);

        const nextDisplayOrder = (existingSets?.[0]?.display_order ?? 0) + 1;

        // Create the question set
        const { data: questionSet, error: setError } = await supabase
            .from('question_sets')
            .insert({
                paper_id,
                section,
                set_type,
                content_layout: content_layout || 'single_focus',
                context_title: context_title || null,
                context_body: context_body || null,
                context_image_url: context_image_url || null,
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
            const { data: existingQuestions } = await supabase
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

            const { error: questionsError } = await supabase
                .from('questions')
                .insert(questionsToInsert);

            if (questionsError) {
                console.error('Error creating questions:', questionsError);
                // Rollback: delete the question set
                await supabase.from('question_sets').delete().eq('id', questionSet.id);
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
        const supabase = await sbSSR();

        const { searchParams } = new URL(request.url);
        const paperId = searchParams.get('paper_id');

        let query = supabase
            .from('question_sets_with_questions')
            .select('*')
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
