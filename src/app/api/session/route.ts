import { NextRequest, NextResponse } from 'next/server';
import { initializeExamSession } from '@/features/exam-engine/lib/actions';

export async function POST(req: NextRequest) {
    try {
        const { attemptId } = await req.json();
        if (!attemptId) {
            return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
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
