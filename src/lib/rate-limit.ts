/**
 * @fileoverview Rate Limiting Utility for Pilot Phase
 * @description In-memory rate limiter to protect against frontend loops and abuse
 * @blueprint Security Audit - P0 Fix - Rate Limiting
 */

// =============================================================================
// TYPES
// =============================================================================

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfterMs: number;
}

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

// =============================================================================
// IN-MEMORY STORE
// =============================================================================

/**
 * Simple in-memory rate limit store
 * Note: This resets on server restart and doesn't work across multiple instances
 * For production scale, upgrade to Redis/Upstash
 */
const requestCounts = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
    if (cleanupInterval) return;

    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of requestCounts.entries()) {
            if (now > record.resetAt) {
                requestCounts.delete(key);
            }
        }
    }, CLEANUP_INTERVAL_MS);

    // Don't prevent process exit
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}

// Start cleanup on module load
startCleanup();

// =============================================================================
// RATE LIMIT CONFIGURATIONS
// =============================================================================

/**
 * Rate limit configurations for different endpoints
 * Tuned for pilot phase with ~100 concurrent users
 */
export const RATE_LIMITS = {
    // Exam save operations - generous for pilot (serverless cold starts reset state)
    SAVE_RESPONSE: {
        limit: 200,          // 200 requests (up from 60)
        windowMs: 60_000,    // per minute
    },

    // Exam submissions - slightly more generous for edge cases
    SUBMIT_EXAM: {
        limit: 10,           // 10 submissions (up from 5)
        windowMs: 60_000,    // per minute
    },

    // Authentication operations - more generous for pilot
    AUTH: {
        limit: 30,           // 30 attempts (up from 10)
        windowMs: 60_000,    // per minute
    },

    // Waitlist request submissions
    ACCESS_REQUEST: {
        limit: 5,            // 5 requests
        windowMs: 60_000,    // per minute
    },

    // Start mock attempts (prevent rapid creation)
    START_MOCK: {
        limit: 15,           // 15 attempts
        windowMs: 60_000,    // per minute
    },

    // General API endpoints - generous for pilot
    GENERAL_API: {
        limit: 300,          // 300 requests (up from 100)
        windowMs: 60_000,    // per minute
    },

    // Exam page loads (prevent rapid refreshing)
    EXAM_LOAD: {
        limit: 20,           // 20 loads
        windowMs: 60_000,    // per minute
    },

    // Progress updates (timer sync)
    PROGRESS_UPDATE: {
        limit: 30,           // 30 updates
        windowMs: 60_000,    // per minute
    },
} as const;

// =============================================================================
// CORE RATE LIMITING FUNCTION
// =============================================================================

/**
 * Check if a request is allowed under rate limits
 * 
 * @param identifier - Unique identifier (userId, IP, or combination)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 * 
 * @example
 * ```typescript
 * const result = checkRateLimit(`save:${userId}`, RATE_LIMITS.SAVE_RESPONSE);
 * if (!result.allowed) {
 *     return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    // No existing record or window expired - create new
    if (!record || now > record.resetAt) {
        requestCounts.set(identifier, {
            count: 1,
            resetAt: now + config.windowMs,
        });

        return {
            allowed: true,
            remaining: config.limit - 1,
            resetAt: now + config.windowMs,
            retryAfterMs: 0,
        };
    }

    // Check if limit exceeded
    if (record.count >= config.limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: record.resetAt,
            retryAfterMs: record.resetAt - now,
        };
    }

    // Increment count
    record.count++;

    return {
        allowed: true,
        remaining: config.limit - record.count,
        resetAt: record.resetAt,
        retryAfterMs: 0,
    };
}

// =============================================================================
// CONVENIENCE HELPERS
// =============================================================================

/**
 * Create rate limit key for user-specific limits
 */
export function userRateLimitKey(endpoint: string, userId: string): string {
    return `user:${userId}:${endpoint}`;
}

/**
 * Create rate limit key for IP-based limits
 */
export function ipRateLimitKey(endpoint: string, ip: string): string {
    return `ip:${ip}:${endpoint}`;
}

/**
 * Create rate limit key combining user and endpoint
 */
export function createRateLimitKey(
    type: 'user' | 'ip' | 'combined',
    endpoint: string,
    identifier: string,
    secondaryIdentifier?: string
): string {
    switch (type) {
        case 'user':
            return `user:${identifier}:${endpoint}`;
        case 'ip':
            return `ip:${identifier}:${endpoint}`;
        case 'combined':
            return `combined:${identifier}:${secondaryIdentifier || 'unknown'}:${endpoint}`;
        default:
            return `unknown:${identifier}:${endpoint}`;
    }
}

// =============================================================================
// RATE LIMIT RESPONSE HELPERS
// =============================================================================

/**
 * Create a rate limit exceeded response
 */
export function createRateLimitResponse(result: RateLimitResult): {
    error: string;
    retryAfterSeconds: number;
    limit: number;
    remaining: number;
} {
    return {
        error: 'Rate limit exceeded. Please slow down.',
        retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000),
        limit: 0, // Will be set by caller
        remaining: result.remaining,
    };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
    result: RateLimitResult,
    limit: number
): Record<string, string> {
    return {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
        ...(result.retryAfterMs > 0 && {
            'Retry-After': Math.ceil(result.retryAfterMs / 1000).toString(),
        }),
    };
}

// =============================================================================
// MONITORING / DEBUGGING
// =============================================================================

/**
 * Get current rate limit stats (for monitoring/debugging)
 */
export function getRateLimitStats(): {
    totalKeys: number;
    activeKeys: number;
    keysByPrefix: Record<string, number>;
} {
    const now = Date.now();
    let activeKeys = 0;
    const keysByPrefix: Record<string, number> = {};

    for (const [key, record] of requestCounts.entries()) {
        if (now <= record.resetAt) {
            activeKeys++;
        }

        const prefix = key.split(':')[0];
        keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1;
    }

    return {
        totalKeys: requestCounts.size,
        activeKeys,
        keysByPrefix,
    };
}

/**
 * Clear all rate limit records (for testing)
 */
export function clearRateLimits(): void {
    requestCounts.clear();
}

// =============================================================================
// SUPABASE FREE TIER LIMITS (Reference)
// =============================================================================

/**
 * Supabase Free Tier Limits for reference
 * Use these to tune rate limits appropriately
 */
export const SUPABASE_FREE_TIER = {
    // Database
    MAX_CONNECTIONS: 60,           // Pooled connections
    MAX_ROWS_RETURNED: 1000,       // Per query
    MAX_QUERY_TIME_MS: 8000,       // 8 seconds

    // API
    REQUESTS_PER_SECOND: 100,      // Approximate sustained

    // Auth
    AUTH_REQUESTS_PER_HOUR: 1000,  // Per project

    // Realtime
    MAX_REALTIME_CONNECTIONS: 200, // Concurrent

    // Storage
    MAX_FILE_SIZE_MB: 50,          // Per file
} as const;
