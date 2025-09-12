// Shared type definitions for the application

// =====================================================
// POLL TYPES
// =====================================================

export interface PollOption {
  option_id: string;
  option_text: string;
  order_index: number;
  vote_count: number;
  vote_percentage: number;
  voters?: string[];
}

export interface BasePoll {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  end_date?: string;
  created_by: string;
  allow_multiple_selections: boolean;
}

// Poll with statistics for dashboard
export interface PollWithStats extends BasePoll {
  option_count: number;
  total_votes: number;
  unique_voters: number;
}

// Poll with options for voting/results
export interface PollWithOptions extends BasePoll {
  options: PollOption[];
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

// Poll creation data
export interface PollData {
  title: string;
  description?: string;
  options: { text: string }[];
  allowMultipleSelections: boolean;
  isPublic: boolean;
  endDate?: string;
}

export type PollStatus = 'active' | 'inactive' | 'ended' | 'private';

// =====================================================
// ERROR HANDLING TYPES
// =====================================================

// Standard error response structure
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Error types for different operations
export type AuthError = {
  message: string;
  code?: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'EMAIL_NOT_CONFIRMED' | 'WEAK_PASSWORD' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_EMAIL' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';
};

export type PollError = {
  message: string;
  code?: 'POLL_NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'CREATION_FAILED';
};

export type VoteError = {
  message: string;
  code?: 'ALREADY_VOTED' | 'POLL_ENDED' | 'INVALID_OPTION' | 'SUBMISSION_FAILED';
};

// Generic error handler result
export type ErrorResult<T = unknown> = {
  success: false;
  error: string;
  data?: T;
};

export type SuccessResult<T = unknown> = {
  success: true;
  data: T;
  error?: never;
};

export type Result<T = unknown> = SuccessResult<T> | ErrorResult<T>;

// =====================================================
// FORM TYPES
// =====================================================

// Form validation state
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Form submission state
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
}

// Combined form state
export interface FormState extends FormValidationState, FormSubmissionState {}

// =====================================================
// COMPONENT PROP TYPES
// =====================================================

// Common loading state props
export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

// Common error display props
export interface ErrorProps {
  error: string | null;
  onClearError?: () => void;
}

// Pagination props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// =====================================================
// HOOK RETURN TYPES
// =====================================================

// Poll deletion hook return type
export interface UsePollDeleteReturn {
  isPending: boolean;
  deletingPollId: string | null;
  showDeleteConfirm: string | null;
  error: string | null;
  handleDelete: (pollId: string) => Promise<void>;
  confirmDelete: (pollId: string) => void;
  cancelDelete: () => void;
  clearError: () => void;
}

// Vote stats hook return type
export interface UseVoteStatsReturn {
  stats: {
    totalVotes: number;
    uniqueVoters: number;
    optionStats: Array<{
      optionId: string;
      voteCount: number;
      percentage: number;
    }>;
  } | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// =====================================================
// SERVER ACTION TYPES
// =====================================================

// Server action response wrapper
export type ServerActionResponse<T = unknown> = Promise<Result<T>>;

// Form data processing types
export interface ProcessedFormData {
  [key: string]: string | string[] | File | File[];
}

// =====================================================
// STATISTICS TYPES
// =====================================================

export interface PollStatistics {
  totalPolls: number;
  totalVotes: number;
  averageVotesPerPoll: number;
  mostPopularPoll?: {
    id: string;
    title: string;
    voteCount: number;
  };
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// =====================================================
// UTILITY TYPES
// =====================================================

// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Pick specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Non-nullable type
export type NonNullable<T> = T extends null | undefined ? never : T;
