// Custom hook for poll deletion logic
'use client';

import { useState, useTransition } from 'react';
import { deletePoll } from '@/lib/actions';

export function usePollDelete() {
  const [isPending, startTransition] = useTransition();
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (pollId: string) => {
    setDeletingPollId(pollId);
    setError(null);
    
    startTransition(async () => {
      try {
        await deletePoll(pollId);
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete poll:', error);
        setError('Failed to delete poll. Please try again.');
      } finally {
        setDeletingPollId(null);
      }
    });
  };

  const confirmDelete = (pollId: string) => {
    setShowDeleteConfirm(pollId);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isPending,
    deletingPollId,
    showDeleteConfirm,
    error,
    handleDelete,
    confirmDelete,
    cancelDelete,
    clearError,
  };
}
