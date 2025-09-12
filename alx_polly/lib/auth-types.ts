// Authentication-specific type definitions

import { Session, User, AuthError } from '@supabase/supabase-js';

// =====================================================
// AUTH CONTEXT TYPES
// =====================================================

export interface AuthContextType {
  /** Current Supabase session object containing tokens and session metadata */
  session: Session | null;
  /** Current authenticated user object with user data and metadata */
  user: User | null;
  /** Loading state indicating if authentication status is being determined */
  loading: boolean;
  /** Current authentication error if any */
  error: AuthError | null;
  /** Whether the auth context has been initialized */
  initialized: boolean;
  /** Sign out the current user */
  signOut: () => Promise<boolean>;
  /** Refresh the current session */
  refreshSession: () => Promise<boolean>;
}

// =====================================================
// AUTH FORM TYPES
// =====================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

// =====================================================
// AUTH STATE TYPES
// =====================================================

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  isSubmitted: boolean;
}

export interface LoginState extends AuthState {
  email: string;
  password: string;
}

export interface RegisterState extends AuthState {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

// =====================================================
// AUTH ERROR TYPES
// =====================================================

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_CONFIRMED'
  | 'WEAK_PASSWORD'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'PASSWORD_MISMATCH'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// AuthError is now imported from @supabase/supabase-js
// Custom auth error codes for application-specific errors
export interface CustomAuthError extends AuthError {
  code: AuthErrorCode;
  details?: Record<string, unknown>;
}

// =====================================================
// AUTH VALIDATION TYPES
// =====================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  email: ValidationRule;
  password: ValidationRule;
  confirmPassword: ValidationRule;
  fullName?: ValidationRule;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  general?: string;
}

// =====================================================
// AUTH UTILITY TYPES
// =====================================================

// Higher-order component props
export interface WithAuthProps {
  user: User;
  session: Session;
}

// Auth guard result
export type AuthGuardResult = 
  | { authorized: true; user: User; session: Session }
  | { authorized: false; reason: string };

// Auth action results
export type AuthActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: AuthError };