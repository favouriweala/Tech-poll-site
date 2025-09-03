// Reusable statistics component
'use client';

import { cn } from '@/lib/utils';

interface StatisticProps {
  label: string;
  value: number;
  color: string;
  className?: string;
}

function Statistic({ label, value, color, className }: StatisticProps) {
  return (
    <div className={cn('text-center', className)}>
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

interface PollStatisticsProps {
  optionCount: number;
  totalVotes: number;
  uniqueVoters: number;
  className?: string;
}

export function PollStatistics({ 
  optionCount, 
  totalVotes, 
  uniqueVoters, 
  className 
}: PollStatisticsProps) {
  const stats = [
    { 
      label: 'Options', 
      value: optionCount, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Votes', 
      value: totalVotes, 
      color: 'text-green-600' 
    },
    { 
      label: 'Voters', 
      value: uniqueVoters, 
      color: 'text-purple-600' 
    },
  ];

  return (
    <div className={cn('grid grid-cols-3 gap-4 mb-4', className)}>
      {stats.map((stat) => (
        <Statistic
          key={stat.label}
          label={stat.label}
          value={stat.value}
          color={stat.color}
        />
      ))}
    </div>
  );
}
