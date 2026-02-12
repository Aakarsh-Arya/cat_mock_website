import type { SectionName, TimeRemaining } from '@/types/exam';

type ActionResult<T> = { success: boolean; data?: T; error?: string };

type SaveResponsePayload = {
    attemptId: string;
    questionId: string;
    answer: string | null;
    status: string;
    isMarkedForReview: boolean;
    isVisited?: boolean;
    timeSpentSeconds: number;
    visitCount?: number;
    timePerVisit?: number[];
    userNote?: string;
    sessionToken?: string | null;
    force_resume?: boolean;
};

type SaveBatchItem = Omit<SaveResponsePayload, 'attemptId' | 'sessionToken' | 'force_resume'>;

type SaveBatchPayload = {
    attemptId: string;
    sessionToken?: string | null;
    force_resume?: boolean;
    responses: SaveBatchItem[];
};

type ProgressPayload = {
    attemptId: string;
    timeRemaining: TimeRemaining;
    currentSection: SectionName;
    currentQuestion: number;
    sessionToken?: string | null;
    force_resume?: boolean;
    visitOrder?: Record<string, readonly string[]>;
};

type PausePayload = ProgressPayload & {
    sessionToken?: string | null;
};

type SubmitPayload = {
    attemptId: string;
    sessionToken?: string | null;
    force_resume?: boolean;
    submissionId?: string;
};

/**
 * Generic POST helper with proper response parsing.
 * Handles both { success, data: {...} } and { success, ...data } response formats.
 */
async function postJson<T>(url: string, body: unknown): Promise<ActionResult<T>> {
    try {
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;

        if (!res.ok) {
            if (payload?.code === 'SESSION_CONFLICT') {
                return { success: false, error: 'SESSION_CONFLICT' };
            }
            return { success: false, error: (payload?.error as string) || 'Request failed' };
        }

        // Handle both response formats:
        // 1. { success: true, data: {...} } - standard format
        // 2. { success: true, total_score: ..., ... } - submit format (data at root)
        if (payload?.data !== undefined) {
            return { success: true, data: payload.data as T };
        }

        // For submit response, extract everything except 'success' and 'error' as data
        const data = { ...payload } as Record<string, unknown>;
        delete data.success;
        delete data.error;
        return { success: true, data: data as T };
    } catch {
        return { success: false, error: 'Network error' };
    }
}

export function initializeExamSession(attemptId: string): Promise<ActionResult<{ sessionToken: string }>> {
    return postJson<{ sessionToken: string }>('/api/session', { attemptId });
}

export function saveResponse(payload: SaveResponsePayload): Promise<ActionResult<void>> {
    return postJson<void>('/api/save', payload);
}

export function saveResponsesBatch(payload: SaveBatchPayload): Promise<ActionResult<{ saved: number }>> {
    return postJson<{ saved: number }>('/api/save-batch', payload);
}

export function updateAttemptProgress(payload: ProgressPayload): Promise<ActionResult<void>> {
    return postJson<void>('/api/progress', payload);
}

export function submitExam(payload: SubmitPayload): Promise<ActionResult<Record<string, unknown>>> {
    return postJson<Record<string, unknown>>('/api/submit', payload);
}

export function pauseExam(payload: PausePayload): Promise<ActionResult<void>> {
    return postJson<void>('/api/pause', payload);
}
