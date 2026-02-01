/**
 * @fileoverview Shared API Validation Utilities
 * @description Common validation helpers for exam API routes
 * @blueprint Phase 2 - Deterministic API validation
 */

import { NextResponse } from 'next/server';

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Checks if a value is a non-empty string (after trimming).
 */
export function isNonEmptyString(v: unknown): v is string {
    return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Checks if a value is a finite number (not NaN, not Infinity).
 * IMPORTANT: This correctly handles 0 as a valid value.
 */
export function isFiniteNumber(v: unknown): v is number {
    return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Validates the timeRemaining object has all required section keys with finite numbers.
 */
export function isValidTimeRemaining(
    timeRemaining: unknown
): timeRemaining is { VARC: number; DILR: number; QA: number } {
    if (typeof timeRemaining !== 'object' || timeRemaining === null) {
        return false;
    }

    const tr = timeRemaining as Record<string, unknown>;

    return (
        isFiniteNumber(tr.VARC) &&
        isFiniteNumber(tr.DILR) &&
        isFiniteNumber(tr.QA)
    );
}

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Gets Supabase configuration from environment variables.
 * Returns null if configuration is invalid/missing (fail fast).
 */
export function getSupabaseConfig(): { url: string; anonKey: string } | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.error('SUPABASE_CONFIG_MISSING', {
            hasUrl: Boolean(url),
            hasAnonKey: Boolean(anonKey),
        });
        return null;
    }

    // Sanity check: reject localhost fallbacks in production
    if (url === 'http://localhost:54321' && process.env.NODE_ENV === 'production') {
        console.error('SUPABASE_CONFIG_INVALID', {
            error: 'localhost URL in production',
        });
        return null;
    }

    return { url, anonKey };
}

/**
 * Returns a 500 response for server misconfiguration.
 */
export function serverMisconfiguredResponse(): NextResponse {
    return NextResponse.json(
        { error: 'Server misconfigured. Please contact support.' },
        { status: 500 }
    );
}

// =============================================================================
// COMMON VALIDATION RESPONSES
// =============================================================================

export function missingFieldResponse(field: string): NextResponse {
    return NextResponse.json({ error: `${field} is required` }, { status: 400 });
}

export function invalidFieldResponse(field: string): NextResponse {
    return NextResponse.json({ error: `${field} is invalid` }, { status: 400 });
}

// =============================================================================
// VERSION HEADER (for debugging which code is deployed)
// =============================================================================

export const API_VERSION = '2026-02-01-v2';

export function addVersionHeader(response: NextResponse): NextResponse {
    response.headers.set('X-Route-Version', API_VERSION);
    return response;
}
