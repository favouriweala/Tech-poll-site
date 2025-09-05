'use client';

/**
 * UserPollsList Component
 * 
 * Displays a responsive grid of poll cards for user-created polls with management capabilities.
 * Integrates with the poll deletion system and provides a clean interface for poll management.
 * 
 * Features:
 * - Responsive grid layout (1-3 columns based on screen size)
 * - Integrated poll deletion with confirmation dialog
 * - Edit functionality placeholder (for future implementation)
 * - Error handling and loading states
 * - Real-time poll statistics display
 * - Poll status indicators (active, ended, private)
 * 
 * Component Architecture:
 * - Uses custom usePollDelete hook for deletion logic
 * - Delegates individual poll rendering to PollCard component
 * - Handles confirmation dialogs and error states
 * 
 * @component
 */

import { PollWithStats } from '@/lib/types';
import { usePollDelete } from '@/hooks/usePollDelete';
import { PollCard } from '@/components/poll-card';

/** Props interface for UserPollsList component */
interface UserPollsListProps {
  /** Array of polls with aggregated statistics for display */
  polls: PollWithStats[];
  /** ID of the user who owns these polls */
  userId: string;
}

/**
 * UserPollsList Component Implementation
 * 
 * Renders a grid of poll cards with integrated management functionality.
 * Uses the usePollDelete hook for deletion operations and PollCard for individual polls.
 * 
 * @param polls - Array of user's polls with statistics
 * @param userId - ID of the authenticated user
 * @returns React component displaying poll management grid
 */
export default function UserPollsList({ polls, userId }: UserPollsListProps) {
  const {
    isPending,
    deletingPollId,
    showDeleteConfirm,
    error,
    handleDelete,
    confirmDelete,
    cancelDelete,
    clearError,
  } = usePollDelete();

  const handleEdit = (pollId: string) => {
    // TODO: Implement edit functionality
    alert('Edit functionality will be available in a future update.');
  };

  // Clear error when component mounts with new polls
  if (error) {
    // TODO: Replace with proper toast notification
    console.error(error);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          onEdit={handleEdit}
          onDelete={confirmDelete}
          onConfirmDelete={handleDelete}
          onCancelDelete={cancelDelete}
          showDeleteConfirm={showDeleteConfirm === poll.id}
          isDeleting={isPending && deletingPollId === poll.id}
          error={error && deletingPollId === poll.id ? error : null}
        />
      ))}
    </div>
  );
}
