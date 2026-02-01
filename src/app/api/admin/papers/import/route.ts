import { NextRequest, NextResponse } from 'next/server';
import { sbSSR } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'crypto';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

interface PaperData {
    slug: string;
    title: string;
    description?: string;
    year?: number;
    total_questions?: number;
    total_marks?: number;
    duration_minutes?: number;
    sections?: string[];
    default_positive_marks?: number;
    default_negative_marks?: number;
    difficulty_level?: string;
    is_free?: boolean;
    published?: boolean;
    allow_pause?: boolean;
    attempt_limit?: number;
    paper_key?: string;
}

interface QuestionSet {
    client_set_id: string;
    section: string;
    set_type: string;
    context_type?: string;
    content_layout?: string;
    context_title?: string;
    context_body?: string;
    context_image_url?: string;
    context_additional_images?: unknown[];
    display_order: number;
    is_active?: boolean;
    metadata?: Record<string, unknown>;
}

interface Question {
    client_question_id: string;
    set_ref: string;
    section?: string;
    question_number: number;
    sequence_order: number;
    question_text: string;
    question_type: string;
    question_format?: string;
    taxonomy_type?: string;
    topic_tag?: string;
    difficulty_rationale?: string;
    options?: { id: string; text: string }[];
    correct_answer?: string;
    positive_marks?: number;
    negative_marks?: number;
    difficulty?: string;
    topic?: string;
    subtopic?: string;
    solution_text?: string;
    solution_image_url?: string;
    video_solution_url?: string;
}

interface V3ImportPayload {
    schema_version: string;
    paper: PaperData;
    question_sets: QuestionSet[];
    questions: Question[];
}

// =============================================================================
// VALIDATION (Matches import-paper-v3.mjs)
// =============================================================================

const VALID_SECTIONS = ['VARC', 'DILR', 'QA'];
const VALID_SET_TYPES = ['VARC', 'DILR', 'CASELET', 'ATOMIC'];
const VALID_QUESTION_TYPES = ['MCQ', 'TITA'];
const COMPOSITE_SET_TYPES = ['VARC', 'DILR', 'CASELET'];

class ValidationError extends Error {
    errors: string[];
    constructor(message: string, errors: string[] = []) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

function validateV3Payload(data: V3ImportPayload): Set<string> {
    // Schema version check
    if (data.schema_version !== 'v3.0') {
        throw new ValidationError(
            `Schema version must be 'v3.0'. Got: ${data.schema_version || 'undefined'}`
        );
    }

    // Required root keys
    if (!data.paper) throw new ValidationError('Missing required root key: paper');
    if (!data.question_sets) throw new ValidationError('Missing required root key: question_sets');
    if (!data.questions) throw new ValidationError('Missing required root key: questions');

    // Validate paper
    const paperErrors: string[] = [];
    if (!data.paper.slug) paperErrors.push('paper.slug is required');
    if (!data.paper.title) paperErrors.push('paper.title is required');
    if (data.paper.slug && !/^[a-z0-9-]+$/.test(data.paper.slug)) {
        paperErrors.push(`paper.slug must be lowercase alphanumeric with hyphens: ${data.paper.slug}`);
    }
    if (paperErrors.length > 0) {
        throw new ValidationError('Paper validation failed', paperErrors);
    }

    // Validate question_sets
    const setErrors: string[] = [];
    const clientSetIds = new Set<string>();

    data.question_sets.forEach((set, index) => {
        const prefix = `question_sets[${index}]`;

        if (!set.client_set_id) {
            setErrors.push(`${prefix}.client_set_id is required`);
        } else if (clientSetIds.has(set.client_set_id)) {
            setErrors.push(`${prefix}.client_set_id is duplicate: ${set.client_set_id}`);
        } else {
            clientSetIds.add(set.client_set_id);
        }

        if (!set.section || !VALID_SECTIONS.includes(set.section)) {
            setErrors.push(`${prefix}.section must be one of ${VALID_SECTIONS.join(', ')}`);
        }

        if (!set.set_type || !VALID_SET_TYPES.includes(set.set_type)) {
            setErrors.push(`${prefix}.set_type must be one of ${VALID_SET_TYPES.join(', ')}`);
        }

        if (set.display_order === undefined || set.display_order === null) {
            setErrors.push(`${prefix}.display_order is required`);
        }

        // Composite sets require context_body
        if (COMPOSITE_SET_TYPES.includes(set.set_type)) {
            if (!set.context_body || set.context_body.trim() === '') {
                setErrors.push(`${prefix}.context_body is required for ${set.set_type} sets`);
            }
        }
    });

    if (setErrors.length > 0) {
        throw new ValidationError('Question sets validation failed', setErrors);
    }

    // Validate questions
    const questionErrors: string[] = [];
    const clientQuestionIds = new Set<string>();

    data.questions.forEach((q, index) => {
        const prefix = `questions[${index}]`;

        if (!q.client_question_id) {
            questionErrors.push(`${prefix}.client_question_id is required`);
        } else if (clientQuestionIds.has(q.client_question_id)) {
            questionErrors.push(`${prefix}.client_question_id is duplicate: ${q.client_question_id}`);
        } else {
            clientQuestionIds.add(q.client_question_id);
        }

        if (!q.set_ref) {
            questionErrors.push(`${prefix}.set_ref is required`);
        } else if (!clientSetIds.has(q.set_ref)) {
            questionErrors.push(`${prefix}.set_ref references non-existent set: ${q.set_ref}`);
        }

        if (q.sequence_order === undefined) {
            questionErrors.push(`${prefix}.sequence_order is required`);
        }

        if (q.question_number === undefined) {
            questionErrors.push(`${prefix}.question_number is required`);
        }

        if (!q.question_text) {
            questionErrors.push(`${prefix}.question_text is required`);
        }

        if (!q.question_type || !VALID_QUESTION_TYPES.includes(q.question_type)) {
            questionErrors.push(`${prefix}.question_type must be one of ${VALID_QUESTION_TYPES.join(', ')}`);
        }

        // MCQ requires options
        if (q.question_type === 'MCQ') {
            if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                questionErrors.push(`${prefix}.options is required for MCQ questions`);
            }
        }
    });

    if (questionErrors.length > 0) {
        throw new ValidationError('Questions validation failed', questionErrors);
    }

    return clientSetIds;
}

// =============================================================================
// IMPORT LOGIC
// =============================================================================

function computeJsonHash(data: unknown): string {
    const jsonStr = JSON.stringify(data, Object.keys(data as object).sort());
    return createHash('sha256').update(jsonStr).digest('hex');
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
    const supabase = await sbSSR();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
        // 1. Verify admin user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin (JWT claim first, fallback to profiles via service role)
        const roleFromJwt = user.app_metadata?.user_role ?? user.user_metadata?.role ?? null;
        let isAdmin = roleFromJwt === 'admin';

        if (!isAdmin) {
            const { data: profile, error: profileError } = await adminClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profileError && profile?.role === 'admin') {
                isAdmin = true;
            }
        }

        logger.info('[Import API] Admin check', {
            userId: user.id,
            email: user.email,
            roleFromJwt,
            isAdmin,
        });

        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // 2. Parse request body
        const body = await request.json();
        const data = body.data as V3ImportPayload;
        const publish = body.publish ?? false;
        const notes = body.notes ?? 'Imported via admin API';
        const skipIfDuplicate = body.skipIfDuplicate ?? false;

        // 3. Validate payload
        validateV3Payload(data);

        logger.info('[Import API] Validated v3 payload', {
            slug: data.paper.slug,
            sets: data.question_sets.length,
            questions: data.questions.length,
        });

        // 4. Import paper
        const { data: existingPaper } = await adminClient
            .from('papers')
            .select('id')
            .eq('slug', data.paper.slug)
            .single();

        const paperPayload = {
            slug: data.paper.slug,
            title: data.paper.title,
            description: data.paper.description || null,
            year: data.paper.year || new Date().getFullYear(),
            total_questions: data.paper.total_questions || data.questions.length,
            total_marks: data.paper.total_marks || 198,
            duration_minutes: data.paper.duration_minutes || 120,
            sections: data.paper.sections || ['VARC', 'DILR', 'QA'],
            default_positive_marks: data.paper.default_positive_marks ?? 3.0,
            default_negative_marks: data.paper.default_negative_marks ?? 1.0,
            difficulty_level: data.paper.difficulty_level || 'medium',
            is_free: data.paper.is_free ?? false,
            published: publish,
            allow_pause: data.paper.allow_pause ?? true,
            attempt_limit: data.paper.attempt_limit ?? 0,
        };

        let paper;
        if (existingPaper) {
            const { data: updated, error } = await adminClient
                .from('papers')
                .update(paperPayload)
                .eq('id', existingPaper.id)
                .select()
                .single();
            if (error) throw error;
            paper = updated;
        } else {
            const { data: inserted, error } = await adminClient
                .from('papers')
                .insert(paperPayload)
                .select()
                .single();
            if (error) throw error;
            paper = inserted;
        }

        // 5. Import question_sets FIRST (build client_set_id → UUID map)
        // Delete existing sets
        await adminClient.from('question_sets').delete().eq('paper_id', paper.id);

        const setIdMap: Record<string, string> = {};

        const setsToInsert = data.question_sets.map((set) => {
            const newId = randomUUID();
            setIdMap[set.client_set_id] = newId;

            // Infer context_type
            let contextType = set.context_type;
            if (!contextType && set.set_type !== 'ATOMIC') {
                contextType = {
                    'VARC': 'rc_passage',
                    'DILR': 'dilr_set',
                    'CASELET': 'caselet'
                }[set.set_type] || 'other_shared_stimulus';
            }

            let contentLayout = set.content_layout || 'single_focus';
            if (!set.content_layout) {
                if (set.context_image_url) {
                    contentLayout = 'image_top';
                } else if (set.set_type === 'VARC') {
                    contentLayout = 'split_passage';
                } else if (set.set_type === 'DILR') {
                    contentLayout = 'split_chart';
                } else if (set.set_type === 'CASELET') {
                    contentLayout = 'split_table';
                } else {
                    contentLayout = 'single_focus';
                }
            }

            return {
                id: newId,
                paper_id: paper.id,
                section: set.section,
                set_type: set.set_type,
                context_type: contextType ?? null,
                content_layout: contentLayout,
                context_title: set.context_title || null,
                context_body: set.context_body || null,
                context_image_url: set.context_image_url || null,
                context_additional_images: set.context_additional_images || null,
                display_order: set.display_order,
                is_active: set.is_active ?? true,
                is_published: publish,
                metadata: set.metadata || {},
                client_set_id: set.client_set_id,
            };
        });

        const { error: setsError } = await adminClient.from('question_sets').insert(setsToInsert);
        if (setsError) throw setsError;

        // 6. Import questions using set_ref → set_id mapping
        await adminClient.from('questions').delete().eq('paper_id', paper.id);

        const questionsToInsert = data.questions.map((q) => {
            const setId = setIdMap[q.set_ref];
            if (!setId) {
                throw new Error(`Question ${q.client_question_id} references unknown set: ${q.set_ref}`);
            }

            return {
                id: randomUUID(),
                paper_id: paper.id,
                section: q.section,
                question_number: q.question_number,
                question_text: q.question_text,
                question_type: q.question_type,
                question_format: q.question_format || q.question_type,
                taxonomy_type: q.taxonomy_type || null,
                topic_tag: q.topic_tag || null,
                difficulty_rationale: q.difficulty_rationale || null,
                options: q.options || null,
                correct_answer: q.correct_answer,
                positive_marks: q.positive_marks ?? 3.0,
                negative_marks: q.negative_marks ?? (q.question_type === 'TITA' ? 0 : 1.0),
                difficulty: q.difficulty || null,
                topic: q.topic || null,
                subtopic: q.subtopic || null,
                solution_text: q.solution_text || null,
                solution_image_url: q.solution_image_url || null,
                video_solution_url: q.video_solution_url || null,
                set_id: setId,
                sequence_order: q.sequence_order,
                is_active: true,
                client_question_id: q.client_question_id,
            };
        });

        const { error: questionsError } = await adminClient.from('questions').insert(questionsToInsert);
        if (questionsError) throw questionsError;

        // 7. Create ingest run
        const canonicalHash = computeJsonHash(data);

        if (skipIfDuplicate) {
            const { data: existing } = await adminClient
                .from('paper_ingest_runs')
                .select('id, version_number')
                .eq('paper_id', paper.id)
                .eq('canonical_json_hash', canonicalHash)
                .single();

            if (existing) {
                return NextResponse.json({
                    success: true,
                    skipped: true,
                    paperId: paper.id,
                    slug: paper.slug,
                    message: `Duplicate detected - already imported as version ${existing.version_number}`,
                });
            }
        }

        const { data: maxVersion } = await adminClient
            .from('paper_ingest_runs')
            .select('version_number')
            .eq('paper_id', paper.id)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        const nextVersion = (maxVersion?.version_number || 0) + 1;

        const { data: ingestRun, error: ingestError } = await adminClient
            .from('paper_ingest_runs')
            .insert({
                paper_id: paper.id,
                schema_version: 'v3.0',
                version_number: nextVersion,
                canonical_paper_json: data,
                canonical_json_hash: canonicalHash,
                import_notes: notes,
            })
            .select()
            .single();

        if (ingestError) throw ingestError;

        // Update paper's latest_ingest_run_id
        await adminClient
            .from('papers')
            .update({ latest_ingest_run_id: ingestRun.id })
            .eq('id', paper.id);

        logger.info('[Import API] Import complete', {
            paperId: paper.id,
            slug: paper.slug,
            version: nextVersion,
            sets: data.question_sets.length,
            questions: data.questions.length,
            published: publish,
        });

        return NextResponse.json({
            success: true,
            paperId: paper.id,
            slug: paper.slug,
            version: nextVersion,
            setsCount: data.question_sets.length,
            questionsCount: data.questions.length,
            published: publish,
        });

    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({
                error: 'Validation failed',
                message: err.message,
                details: err.errors,
            }, { status: 400 });
        }

        logger.error('[Import API] Import failed', { error: err });
        return NextResponse.json({
            error: 'Import failed',
            message: err instanceof Error ? err.message : 'Unknown error',
        }, { status: 500 });
    }
}
