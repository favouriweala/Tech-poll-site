'use client'

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deletePoll } from "@/lib/actions";

interface Poll {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  end_date?: string;
  option_count: number;
  total_votes: number;
  unique_voters: number;
}

interface UserPollsListProps {
  polls: Poll[];
  userId: string;
}

export default function UserPollsList({ polls, userId }: UserPollsListProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (pollId: string) => {
    setDeletingPollId(pollId);
    startTransition(async () => {
      try {
        await deletePoll(pollId);
        // The page will refresh automatically due to revalidatePath in deletePoll
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete poll:', error);
        alert('Failed to delete poll. Please try again.');
      } finally {
        setDeletingPollId(null);
      }
    });
  };

  const isPollEnded = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) <= new Date();
  };

  const canEdit = (poll: Poll) => {
    // Can edit if poll has no votes yet
    return poll.total_votes === 0;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <Card key={poll.id} className="relative group hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {poll.title}
                </CardTitle>
                {poll.description && (
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {poll.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                {!poll.is_active && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
                {isPollEnded(poll.end_date) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Ended
                  </span>
                )}
                {!poll.is_public && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Private
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{poll.option_count}</div>
                <div className="text-xs text-gray-500">Options</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{poll.total_votes}</div>
                <div className="text-xs text-gray-500">Votes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{poll.unique_voters}</div>
                <div className="text-xs text-gray-500">Voters</div>
              </div>
            </div>

            {/* Created date */}
            <div className="text-xs text-gray-500 mb-4">
              Created {formatDate(poll.created_at)}
              {poll.end_date && (
                <span className="block">
                  Ends {formatDate(poll.end_date)}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Link href={`/polls/${poll.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  View
                </Button>
              </Link>
              
              {canEdit(poll) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    // For now, we'll just alert that edit is not implemented
                    // In a full implementation, this would navigate to an edit page
                    alert('Edit functionality will be available in a future update.');
                  }}
                >
                  Edit
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isPending && deletingPollId === poll.id}
                onClick={() => setShowDeleteConfirm(poll.id)}
              >
                {isPending && deletingPollId === poll.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm === poll.id && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 mb-3">
                  Are you sure you want to delete this poll? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(poll.id)}
                    disabled={isPending}
                  >
                    {isPending && deletingPollId === poll.id ? 'Deleting...' : 'Yes, Delete'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
