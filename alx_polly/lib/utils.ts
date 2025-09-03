export function cn(...classes: Array<string | null | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

// Date formatting utilities
export const formatDate = (dateString: string, locale: string = 'en-US'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Poll utility functions
export const isPollEnded = (endDate?: string): boolean => {
  if (!endDate) return false;
  return new Date(endDate) <= new Date();
};

export const canEditPoll = (poll: { total_votes: number }): boolean => {
  return poll.total_votes === 0;
};

export const getPollStatus = (poll: {
  is_active: boolean;
  is_public: boolean;
  end_date?: string;
}) => {
  const statuses: string[] = [];
  
  if (!poll.is_active) statuses.push('inactive');
  if (isPollEnded(poll.end_date)) statuses.push('ended');
  if (!poll.is_public) statuses.push('private');
  
  return statuses;
};

