// Shared type definitions for the application

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
