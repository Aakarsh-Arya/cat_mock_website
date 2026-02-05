import { NextRequest, NextResponse } from 'next/server';
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
            .select('status')
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (attemptError || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { status: attempt.status } });
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
}
