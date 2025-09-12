// Custom hook for poll deletion logic
'use client';

import { useState, useTransition } from 'react';
import { deletePoll } from '@/lib/actions';
import type { UsePollDeleteReturn } from '@/lib/types';

export function usePollDelete(): UsePollDeleteReturn {
  const [isPending, startTransition] = useTransition();
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (pollId: string) => {
    setDeletingPollId(pollId);
    setError(null);
    
    startTransition(async () => {
      try {
        setDeletingPollId(pollId);
        const result = await deletePoll(pollId);
        
        if (result.success) {
          setShowDeleteConfirm(null);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (error: unknown) {
        console.error('Failed to delete poll:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete poll. Please try again.');
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
