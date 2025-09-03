// Individual poll card component
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PollWithStats } from '@/lib/types';
import { formatDate, canEditPoll, getPollStatus } from '@/lib/utils';
import { PollStatusBadges } from '@/components/ui/poll-status-badges';
import { PollStatistics } from '@/components/ui/poll-statistics';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';

interface PollCardProps {
  poll: PollWithStats;
  onEdit: (pollId: string) => void;
  onDelete: (pollId: string) => void;
  onConfirmDelete: (pollId: string) => void;
  onCancelDelete: () => void;
  showDeleteConfirm: boolean;
  isDeleting: boolean;
  error?: string | null;
}

export function PollCard({
  poll,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  showDeleteConfirm,
  isDeleting,
  error
}: PollCardProps) {
  const statuses = getPollStatus(poll);

  return (
    <Card className="relative group hover:shadow-lg transition-shadow">
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
          <div className="ml-2">
            <PollStatusBadges statuses={statuses} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <PollStatistics 
          optionCount={poll.option_count}
          totalVotes={poll.total_votes}
          uniqueVoters={poll.unique_voters}
        />

        {/* Created date */}
        <div className="text-xs text-gray-500 mb-4">
          Created {formatDate(poll.created_at)}
          {poll.end_date && (
            <span className="block">
              Ends {formatDate(poll.end_date)}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link href={`/polls/${poll.id}`} className="flex-1">
            <Button variant="outline" className="w-full text-sm py-2 text-black hover:text-black">
              View
            </Button>
          </Link>
          
          {canEditPoll(poll) && (
            <Button 
              variant="outline" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm py-2 px-3"
              onClick={() => onEdit(poll.id)}
            >
              Edit
            </Button>
          )}

          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm py-2 px-3"
            disabled={isDeleting}
            onClick={() => onDelete(poll.id)}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>

        <DeleteConfirmation
          isVisible={showDeleteConfirm}
          isDeleting={isDeleting}
          onConfirm={() => onConfirmDelete(poll.id)}
          onCancel={onCancelDelete}
          message="Are you sure you want to delete this poll? This action cannot be undone."
        />
      </CardContent>
    </Card>
  );
}
