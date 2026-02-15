import { NextResponse } from 'next/server';
import { sbSSR } from '@/lib/supabase/server';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import { ensureActiveAccess } from '@/lib/access-control';
import { checkRateLimit, RATE_LIMITS, userRateLimitKey } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { incrementMetric } from '@/lib/telemetry';
import { getSectionDurationSecondsMap, type SectionConfig, type SectionName } from '@/types/exam';

type AttemptMode = 'full' | 'sectional';

type PaperData = {
    id: string;
    published: boolean;
    sections: SectionConfig[];
    duration_minutes: number;
    attempt_limit: number | null;
    allow_sectional_attempts?: boolean | null;
    sectional_allowed_sections?: SectionName[] | null;
};

function redirectTo(path: string, request: Request): NextResponse {
    return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function normalizeSectionalAllowedSections(
    raw: unknown,
    fallbackSections: readonly SectionConfig[]
): SectionName[] {
    const availableSections = new Set<SectionName>(
        fallbackSections
            .map((section) => section?.name)
            .filter((name): name is SectionName => name === 'VARC' || name === 'DILR' || name === 'QA')
    );

    if (availableSections.size === 0) {
        availableSections.add('VARC');
        availableSections.add('DILR');
        availableSections.add('QA');
    }

    if (!Array.isArray(raw)) {
        return Array.from(availableSections);
    }

    const normalized = raw
        .map((entry) => (typeof entry === 'string' ? entry.toUpperCase().trim() : ''))
        .filter((entry): entry is SectionName => entry === 'VARC' || entry === 'DILR' || entry === 'QA')
        .filter((entry) => availableSections.has(entry));

    return normalized.length > 0 ? normalized : Array.from(availableSections);
}

const COMPLETED_STATUSES = ['completed', 'submitted'] as const;
const ACTIVE_STATUSES = ['in_progress', 'paused'] as const;

export async function POST(
    request: Request,
    { params }: { params: Promise<{ paperId: string }> }
) {
    const { paperId } = await params;
    const formData = await request.formData();

    const modeRaw = String(formData.get('mode') || 'full').toLowerCase();
    const mode: AttemptMode = modeRaw === 'sectional' ? 'sectional' : 'full';
    const sectionRaw = String(formData.get('section') || '').toUpperCase();
    const sectionalSection: SectionName | undefined =
        sectionRaw === 'VARC' || sectionRaw === 'DILR' || sectionRaw === 'QA'
            ? (sectionRaw as SectionName)
            : undefined;

    if (mode === 'sectional' && !sectionalSection) {
        return redirectTo(`/mock/${paperId}?error=invalid_sectional`, request);
    }

    const s = await sbSSR();
    const {
        data: { user: currentUser },
    } = await s.auth.getUser();

    if (!currentUser) {
        return redirectTo(`/auth/sign-in?redirect_to=${encodeURIComponent(`/mock/${paperId}`)}`, request);
    }

    const access = await ensureActiveAccess(s, currentUser.id, currentUser);
    if (!access.allowed) {
        return redirectTo(`/coming-soon?redirect_to=${encodeURIComponent(`/mock/${paperId}`)}`, request);
    }

    const rateKey = userRateLimitKey('start_mock', currentUser.id);
    const rateResult = checkRateLimit(rateKey, RATE_LIMITS.START_MOCK);
    if (!rateResult.allowed) {
        return redirectTo(`/mock/${paperId}?error=rate_limited`, request);
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paperId);
    let p: PaperData | null = null;

    if (isUUID) {
        const result = await s
            .from('papers')
            .select('id, published, sections, duration_minutes, attempt_limit, allow_sectional_attempts, sectional_allowed_sections')
            .eq('id', paperId)
            .maybeSingle();
        if (result.error?.code === '42703') {
            const fallback = await s
                .from('papers')
                .select('id, published, sections, duration_minutes, attempt_limit')
                .eq('id', paperId)
                .maybeSingle();
            p = fallback.data
                ? {
                    ...fallback.data,
                    allow_sectional_attempts: false,
                    sectional_allowed_sections: ['VARC', 'DILR', 'QA'],
                }
                : null;
        } else {
            p = result.data as PaperData | null;
        }
    }

    if (!p) {
        const result = await s
            .from('papers')
            .select('id, published, sections, duration_minutes, attempt_limit, allow_sectional_attempts, sectional_allowed_sections')
            .eq('slug', paperId)
            .maybeSingle();
        if (result.error?.code === '42703') {
            const fallback = await s
                .from('papers')
                .select('id, published, sections, duration_minutes, attempt_limit')
                .eq('slug', paperId)
                .maybeSingle();
            p = fallback.data
                ? {
                    ...fallback.data,
                    allow_sectional_attempts: false,
                    sectional_allowed_sections: ['VARC', 'DILR', 'QA'],
                }
                : null;
        } else {
            p = result.data as PaperData | null;
        }
    }

    if (!p || p.published !== true) {
        return redirectTo(`/mock/${paperId}?error=paper_unavailable`, request);
    }

    const sections = (p.sections as SectionConfig[]) || [];
    const allowedSectionals = normalizeSectionalAllowedSections(p.sectional_allowed_sections, sections);

    if (mode === 'sectional') {
        if (!p.allow_sectional_attempts) {
            return redirectTo(`/mock/${paperId}?error=sectional_not_allowed`, request);
        }
        if (!sectionalSection || !allowedSectionals.includes(sectionalSection)) {
            return redirectTo(`/mock/${paperId}?error=invalid_sectional`, request);
        }
    }

    const normalizeAttemptMode = (value: unknown): AttemptMode =>
        value === 'sectional' ? 'sectional' : 'full';
    const normalizeSectionName = (value: unknown): SectionName | null =>
        value === 'VARC' || value === 'DILR' || value === 'QA' ? value : null;

    const attemptMode: AttemptMode = mode === 'sectional' ? 'sectional' : 'full';
    const sectionalAttemptSection: SectionName | null =
        attemptMode === 'sectional' ? sectionalSection ?? null : null;

    const adminClient = getServiceRoleClient();

    try {
        let existingActiveAttempts: Array<{
            id: string;
            attempt_mode: AttemptMode;
            sectional_section: SectionName | null;
        }> = [];

        const existingAttemptsResult = await adminClient
            .from('attempts')
            .select('id, status, attempt_mode, sectional_section')
            .eq('paper_id', p.id)
            .eq('user_id', currentUser.id)
            .in('status', [...ACTIVE_STATUSES])
            .order('created_at', { ascending: false });

        if (existingAttemptsResult.error?.code === '42703') {
            const fallback = await adminClient
                .from('attempts')
                .select('id, status')
                .eq('paper_id', p.id)
                .eq('user_id', currentUser.id)
                .in('status', [...ACTIVE_STATUSES])
                .order('created_at', { ascending: false });

            existingActiveAttempts = (fallback.data ?? []).map((attemptRow) => ({
                id: attemptRow.id,
                attempt_mode: 'full',
                sectional_section: null,
            }));
        } else {
            existingActiveAttempts = (existingAttemptsResult.data ?? []).map((attemptRow) => ({
                id: attemptRow.id,
                attempt_mode: normalizeAttemptMode(attemptRow.attempt_mode),
                sectional_section: normalizeSectionName(attemptRow.sectional_section),
            }));
        }

        const idempotentMatch = existingActiveAttempts.find((attemptRow) =>
            attemptRow.attempt_mode === attemptMode &&
            (attemptRow.sectional_section ?? null) === (sectionalAttemptSection ?? null)
        );
        if (idempotentMatch) {
            return redirectTo(`/exam/${idempotentMatch.id}`, request);
        }
    } catch (error) {
        logger.warn('Failed to resolve existing active attempts for start route', error, {
            paperId: p.id,
            userId: currentUser.id,
            mode: attemptMode,
            section: sectionalAttemptSection,
        });
    }

    const attemptLimitServer = p.attempt_limit ?? null;
    if (attemptLimitServer !== null && attemptLimitServer > 0) {
        let attemptCount = 0;
        const completedRows = await adminClient
            .from('attempts')
            .select('id, attempt_mode, sectional_section')
            .eq('paper_id', p.id)
            .eq('user_id', currentUser.id)
            .in('status', [...COMPLETED_STATUSES]);

        if (completedRows.error?.code === '42703') {
            const fallback = await adminClient
                .from('attempts')
                .select('id', { count: 'exact', head: true })
                .eq('paper_id', p.id)
                .eq('user_id', currentUser.id)
                .in('status', [...COMPLETED_STATUSES]);
            attemptCount = fallback.count ?? 0;
        } else {
            attemptCount = (completedRows.data ?? []).filter((attemptRow) => {
                const rowMode = normalizeAttemptMode(attemptRow.attempt_mode);
                const rowSection = normalizeSectionName(attemptRow.sectional_section);
                if (attemptMode === 'full') {
                    return rowMode === 'full';
                }
                return rowMode === 'sectional' && rowSection === sectionalAttemptSection;
            }).length;
        }

        if (attemptCount >= attemptLimitServer) {
            return redirectTo(`/mock/${paperId}?limit_reached=1`, request);
        }
    }

    const sectionDurations = getSectionDurationSecondsMap(sections);
    const timeRemaining: Record<SectionName, number> = {
        VARC: sectionDurations.VARC,
        DILR: sectionDurations.DILR,
        QA: sectionDurations.QA,
    };

    let currentSection: SectionName = 'VARC';
    if (attemptMode === 'sectional' && sectionalAttemptSection) {
        currentSection = sectionalAttemptSection;
        timeRemaining.VARC = sectionalAttemptSection === 'VARC' ? sectionDurations.VARC : 0;
        timeRemaining.DILR = sectionalAttemptSection === 'DILR' ? sectionDurations.DILR : 0;
        timeRemaining.QA = sectionalAttemptSection === 'QA' ? sectionDurations.QA : 0;
    }

    let { data: attempt, error: insertErr } = await s
        .from('attempts')
        .insert({
            paper_id: p.id,
            user_id: currentUser.id,
            status: 'in_progress',
            attempt_mode: attemptMode,
            sectional_section: sectionalAttemptSection,
            current_section: currentSection,
            current_question: 1,
            time_remaining: timeRemaining,
        })
        .select('id')
        .single();

    if (insertErr?.code === '42703') {
        const retry = await s
            .from('attempts')
            .insert({
                paper_id: p.id,
                user_id: currentUser.id,
                status: 'in_progress',
                current_section: currentSection,
                current_question: 1,
                time_remaining: timeRemaining,
            })
            .select('id')
            .single();
        attempt = retry.data ?? attempt;
        insertErr = retry.error ?? null;
    }

    if (insertErr?.code === '23505') {
        const activeNow = await adminClient
            .from('attempts')
            .select('id, attempt_mode, sectional_section')
            .eq('paper_id', p.id)
            .eq('user_id', currentUser.id)
            .in('status', [...ACTIVE_STATUSES])
            .order('created_at', { ascending: false });

        const activeRows = activeNow.data ?? [];
        const matching = activeRows.find((row) =>
            normalizeAttemptMode(row.attempt_mode) === attemptMode &&
            (normalizeSectionName(row.sectional_section) ?? null) === (sectionalAttemptSection ?? null)
        );

        if (matching?.id) {
            return redirectTo(`/exam/${matching.id}`, request);
        }

        // Old DB unique index (user+paper) still present: send user to detail page with clear hint.
        return redirectTo(`/mock/${paperId}?error=active_attempt_conflict`, request);
    }

    if (insertErr || !attempt) {
        logger.error('Failed to create attempt from start route', insertErr, {
            paperId: p.id,
            userId: currentUser.id,
            mode: attemptMode,
            section: sectionalAttemptSection,
        });
        return redirectTo(`/mock/${paperId}?error=start_failed`, request);
    }

    incrementMetric('attempt_created');
    return redirectTo(`/exam/${attempt.id}`, request);
}
