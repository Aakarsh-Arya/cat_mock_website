import { NextRequest, NextResponse } from 'next/server';
import { initializeExamSession } from '@/features/exam-engine/lib/actions';
import { sbSSR } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { attemptId } = await req.json();
        if (!attemptId) {
            return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
        }

        const supabase = await sbSSR();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { data: attempt, error: attemptError } = await supabase
            .from('attempts')
            .select('id, user_id, status, session_token')
            .eq('id', attemptId)
            .maybeSingle();

        if (attemptError || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        if (attempt.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (attempt.status !== 'in_progress' && attempt.status !== 'paused') {
            return NextResponse.json({ error: 'Attempt is not active' }, { status: 400 });
        }

        // Important: paused attempts must run initializeExamSession so they resume to in_progress
        // and get an updated session token before client save/pause APIs are called.
        if (
            attempt.status === 'in_progress' &&
            typeof attempt.session_token === 'string' &&
            attempt.session_token.length > 0
        ) {
            return NextResponse.json({ success: true, data: { sessionToken: attempt.session_token } });
        }

        const result = await initializeExamSession(attemptId);
        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to initialize session' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}
