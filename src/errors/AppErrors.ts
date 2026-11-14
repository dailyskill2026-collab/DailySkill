/**
 * Sprint 16: Standardized Application Error Framework
 * Provides typed error classes, error codes, HTTP status mappings,
 * and user-safe error message extractors.
 */

export type ErrorCode =
  | 'ERR_VALIDATION'
  | 'ERR_UNAUTHORIZED'
  | 'ERR_FORBIDDEN'
  | 'ERR_NOT_FOUND'
  | 'ERR_CONFLICT'
  | 'ERR_RATE_LIMIT'
  | 'ERR_SERVICE_UNAVAILABLE'
  | 'ERR_STORAGE'
  | 'ERR_UNKNOWN';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: unknown;

  constructor(options: {
    message: string;
    code: ErrorCode;
    statusCode: number;
    userMessage?: string;
    details?: unknown;
  }) {
    super(options.message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.userMessage = options.userMessage || options.message;
    this.details = options.details;

    // Maintains proper stack trace in V8 / Node
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown, userMessage?: string) {
    super({
      message,
      code: 'ERR_VALIDATION',
      statusCode: 400,
      userMessage: userMessage || 'The information provided is invalid or incomplete.',
      details,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details?: unknown) {
    super({
      message,
      code: 'ERR_UNAUTHORIZED',
      statusCode: 401,
      userMessage: 'Please sign in to continue.',
      details,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details?: unknown) {
    super({
      message,
      code: 'ERR_FORBIDDEN',
      statusCode: 403,
      userMessage: 'You do not have permission to perform this action.',
      details,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resourceName = 'Resource', resourceId?: string) {
    const idInfo = resourceId ? ` with ID '${resourceId}'` : '';
    super({
      message: `${resourceName}${idInfo} not found`,
      code: 'ERR_NOT_FOUND',
      statusCode: 404,
      userMessage: `${resourceName} could not be found.`,
      details: { resourceName, resourceId },
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      code: 'ERR_CONFLICT',
      statusCode: 409,
      userMessage: 'A conflicting record already exists.',
      details,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfterSeconds = 60) {
    super({
      message,
      code: 'ERR_RATE_LIMIT',
      statusCode: 429,
      userMessage: `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
      details: { retryAfterSeconds },
    });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(serviceName = 'Service', details?: unknown) {
    super({
      message: `${serviceName} is currently unavailable`,
      code: 'ERR_SERVICE_UNAVAILABLE',
      statusCode: 503,
      userMessage: 'The service is temporarily unavailable. Please try again shortly.',
      details,
    });
  }
}

export class StorageError extends AppError {
  constructor(operation: string, details?: unknown) {
    super({
      message: `Storage operation failed during ${operation}`,
      code: 'ERR_STORAGE',
      statusCode: 500,
      userMessage: 'An error occurred while saving your data. Please try again.',
      details,
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function mapErrorToUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
