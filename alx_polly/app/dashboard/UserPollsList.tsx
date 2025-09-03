'use client';

import { PollWithStats } from '@/lib/types';
import { usePollDelete } from '@/hooks/usePollDelete';
import { PollCard } from '@/components/poll-card';

interface UserPollsListProps {
  polls: PollWithStats[];
  userId: string;
}

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
