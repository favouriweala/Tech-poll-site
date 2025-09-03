// Reusable status badge component
'use client';

import { cn } from '@/lib/utils';

type PollStatus = 'inactive' | 'ended' | 'private' | 'active';

interface StatusBadgeProps {
  status: PollStatus;
  className?: string;
}

const statusConfig = {
  inactive: {
    className: 'bg-red-100 text-red-800',
    label: 'Inactive'
  },
  ended: {
    className: 'bg-yellow-100 text-yellow-800',
    label: 'Ended'
  },
  private: {
    className: 'bg-blue-100 text-blue-800',
    label: 'Private'
  },
  active: {
    className: 'bg-green-100 text-green-800',
    label: 'Active'
  }
};

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}

interface PollStatusBadgesProps {
  statuses: string[];
  className?: string;
}

export function PollStatusBadges({ statuses, className }: PollStatusBadgesProps) {
  const validStatuses = statuses.filter((status): status is PollStatus => 
    ['inactive', 'ended', 'private', 'active'].includes(status)
  );

  if (validStatuses.length === 0) return null;

  return (
    <div className={cn('flex gap-1', className)}>
      {validStatuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  );
}
