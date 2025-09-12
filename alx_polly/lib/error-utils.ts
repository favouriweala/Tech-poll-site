// Error handling utilities with proper TypeScript types

import type { AuthError, PollError, VoteError, ApiError, Result } from './types';
import type { AuthErrorCode } from './auth-types';

// =====================================================
// ERROR TYPE GUARDS
// =====================================================

/**
 * Type guard to check if an error is a Supabase auth error
 */
export function isSupabaseAuthError(error: unknown): error is { message: string; status?: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Type guard to check if an error is a standard Error object
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if an error is a Next.js redirect
 */
export function isNextRedirect(error: unknown): boolean {
  return isError(error) && error.message === 'NEXT_REDIRECT';
}

// =====================================================
// ERROR SANITIZATION
// =====================================================

/**
 * Sanitizes error messages to prevent sensitive information leakage
 */
export function sanitizeError(error: unknown): string {
  if (isError(error)) {
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      // Map common error patterns to user-friendly messages
      if (error.message.includes('fetch')) {
        return 'Network error. Please check your connection and try again.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      if (error.message.includes('unauthorized')) {
        return 'You are not authorized to perform this action.';
      }
      return 'An unexpected error occurred. Please try again.';
    }
    return error.message;
  }
  
  if (isSupabaseAuthError(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

// =====================================================
// ERROR MAPPING
// =====================================================

/**
 * Maps Supabase auth errors to user-friendly messages
 */
export function mapAuthError(error: unknown): AuthError {
  const message = sanitizeError(error);
  
  // Map common Supabase auth error messages to error codes
  let code: AuthErrorCode = 'UNKNOWN_ERROR';
  
  if (message.includes('Invalid login credentials')) {
    code = 'INVALID_CREDENTIALS';
  } else if (message.includes('User not found')) {
    code = 'USER_NOT_FOUND';
  } else if (message.includes('Email not confirmed')) {
    code = 'EMAIL_NOT_CONFIRMED';
  } else if (message.includes('Password should be at least')) {
    code = 'WEAK_PASSWORD';
  } else if (message.includes('User already registered')) {
    code = 'EMAIL_ALREADY_EXISTS';
  } else if (message.includes('Invalid email')) {
    code = 'INVALID_EMAIL';
  } else if (message.includes('network') || message.includes('fetch')) {
    code = 'NETWORK_ERROR';
  }
  
  return { message, code };
}

/**
 * Maps poll-related errors to structured error objects
 */
export function mapPollError(error: unknown): PollError {
  const message = sanitizeError(error);
  
  let code: PollError['code'] = 'CREATION_FAILED';
  
  if (message.includes('not found')) {
    code = 'POLL_NOT_FOUND';
  } else if (message.includes('unauthorized') || message.includes('permission')) {
    code = 'UNAUTHORIZED';
  } else if (message.includes('validation') || message.includes('required')) {
    code = 'VALIDATION_ERROR';
  }
  
  return { message, code };
}

/**
 * Maps vote-related errors to structured error objects
 */
export function mapVoteError(error: unknown): VoteError {
  const message = sanitizeError(error);
  
  let code: VoteError['code'] = 'SUBMISSION_FAILED';
  
  if (message.includes('already voted')) {
    code = 'ALREADY_VOTED';
  } else if (message.includes('ended') || message.includes('inactive')) {
    code = 'POLL_ENDED';
  } else if (message.includes('invalid option')) {
    code = 'INVALID_OPTION';
  }
  
  return { message, code };
}

// =====================================================
// RESULT WRAPPERS
// =====================================================

/**
 * Wraps a function call in a Result type for consistent error handling
 */
export async function wrapAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: sanitizeError(error) };
  }
}

/**
 * Wraps a synchronous function call in a Result type
 */
export function wrapSync<T>(
  fn: () => T
): Result<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: sanitizeError(error) };
  }
}

// =====================================================
// ERROR LOGGING
// =====================================================

/**
 * Logs errors with appropriate detail level based on environment
 */
export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : '[Error]';
  
  if (process.env.NODE_ENV === 'development') {
    console.error(prefix, error);
  } else {
    // In production, log sanitized error messages only
    console.error(prefix, sanitizeError(error));
  }
}

/**
 * Creates a standardized error logger for specific contexts
 */
export function createErrorLogger(context: string) {
  return (error: unknown, additionalContext?: string) => {
    const fullContext = additionalContext ? `${context}:${additionalContext}` : context;
    logError(error, fullContext);
  };
}

// =====================================================
// ERROR BOUNDARIES
// =====================================================

/**
 * Error boundary fallback component props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Default error fallback component
 */
export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
          <p className="mt-2 text-sm text-gray-500">
            {process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={resetError}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}