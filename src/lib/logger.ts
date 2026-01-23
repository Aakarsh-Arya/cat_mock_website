/**
 * @fileoverview Application Logger Utility
 * @description Structured logging with environment-aware log levels
 * @blueprint M6+ Architecture - Logging Protocol
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Operation completed', { userId, action });
 *   logger.error('Failed to save', { error, context });
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// Set minimum log level based on environment
const getMinLogLevel = (): LogLevel => {
    const env = process.env.NODE_ENV;
    if (env === 'production') return 'warn'; // Production: only warn and error
    if (env === 'test') return 'error'; // Tests: only errors
    return 'debug'; // Development: all logs
};

const MIN_LOG_LEVEL = getMinLogLevel();

// =============================================================================
// LOGGER IMPLEMENTATION
// =============================================================================

/**
 * Formats a log message with timestamp and context
 */
function formatLogMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
        return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    return `${prefix} ${message}`;
}

/**
 * Checks if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

/**
 * Sanitizes context to remove sensitive data
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };

    // Remove sensitive fields
    const sensitiveKeys = [
        'password', 'token', 'secret', 'key', 'authorization',
        'cookie', 'session', 'auth', 'credential', 'apiKey',
    ];

    for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        }
    }

    return sanitized;
}

/**
 * Main logger object with level-specific methods
 */
export const logger = {
    /**
     * Debug level - Development only, detailed information
     */
    debug(message: string, context?: LogContext): void {
        if (shouldLog('debug')) {
            console.log(formatLogMessage('debug', message, sanitizeContext(context)));
        }
    },

    /**
     * Info level - General operational information
     */
    info(message: string, context?: LogContext): void {
        if (shouldLog('info')) {
            console.log(formatLogMessage('info', message, sanitizeContext(context)));
        }
    },

    /**
     * Warn level - Warning conditions that should be addressed
     */
    warn(message: string, error?: unknown, context?: LogContext): void {
        if (shouldLog('warn')) {
            // Handle case where second arg is context, not error
            if (error && typeof error === 'object' && !('message' in error) && !('stack' in error)) {
                console.warn(formatLogMessage('warn', message, sanitizeContext(error as LogContext)));
            } else {
                const errorDetails = error instanceof Error
                    ? { errorMessage: error.message }
                    : error ? { error } : {};

                console.warn(formatLogMessage('warn', message, {
                    ...sanitizeContext(context),
                    ...errorDetails,
                }));
            }
        }
    },

    /**
     * Error level - Error conditions that need immediate attention
     */
    error(message: string, error?: unknown, context?: LogContext): void {
        if (shouldLog('error')) {
            const errorDetails = error instanceof Error
                ? { errorMessage: error.message, stack: error.stack }
                : { error };

            console.error(formatLogMessage('error', message, {
                ...sanitizeContext(context),
                ...errorDetails,
            }));
        }
    },

    /**
     * Log with explicit level
     */
    log(level: LogLevel, message: string, context?: LogContext): void {
        switch (level) {
            case 'debug': this.debug(message, context); break;
            case 'info': this.info(message, context); break;
            case 'warn': this.warn(message, context); break;
            case 'error': this.error(message, undefined, context); break;
        }
    },
};

// =============================================================================
// SPECIALIZED LOGGERS
// =============================================================================

/**
 * Exam-specific logger with context
 */
export const examLogger = {
    attemptStart(attemptId: string, paperId: string, userId: string): void {
        logger.info('Exam attempt started', { attemptId, paperId, userId });
    },

    questionAnswered(attemptId: string, questionId: string): void {
        logger.debug('Question answered', { attemptId, questionId });
    },

    sectionExpired(attemptId: string, section: string): void {
        logger.info('Section timer expired', { attemptId, section });
    },

    examSubmitted(attemptId: string, score: number): void {
        logger.info('Exam submitted', { attemptId, score });
    },

    examPaused(attemptId: string, success?: boolean, error?: unknown): void {
        if (success === false && error) {
            logger.error('Failed to pause exam', error, { attemptId });
        } else {
            logger.info('Exam paused', { attemptId });
        }
    },

    validationError(operation: string, details: LogContext): void {
        logger.warn(`Validation error in ${operation}`, details);
    },

    securityEvent(event: string, details: LogContext): void {
        logger.warn(`Security event: ${event}`, details);
    },
};

/**
 * Admin-specific logger
 */
export const adminLogger = {
    paperCreated(paperId: string, title: string): void {
        logger.info('Paper created', { paperId, title });
    },

    questionCreated(questionId: string, paperId: string): void {
        logger.info('Question created', { questionId, paperId });
    },

    contextCreated(contextId: string, paperId: string): void {
        logger.info('Context created', { contextId, paperId });
    },

    dataModified(entity: string, action: 'create' | 'update' | 'delete' | 'fetch_error' | 'create_error', details?: LogContext): void {
        if (action.includes('error')) {
            logger.error(`${entity} operation failed`, undefined, { action, ...details });
        } else {
            logger.info(`${entity} ${action}d`, details);
        }
    },
};

export default logger;
