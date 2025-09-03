// React hook for optimized vote statistics with caching
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PollOption } from '@/lib/types';
import { VoteStatsManager } from '@/lib/vote-cache';
import { createOptimizedVoteProcessor, VoteStatistics } from '@/lib/vote-utils';

interface UseVoteStatsOptions {
  pollId: string;
  options: PollOption[];
  enableCaching?: boolean;
  refreshInterval?: number;
}

interface UseVoteStatsReturn {
  stats: VoteStatistics;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getVoteCount: (optionId: string) => number;
  getPercentage: (optionId: string) => number;
  isWinning: (optionId: string) => boolean;
  hasVoter: (optionId: string, voterId: string) => boolean;
}

export function useVoteStats({
  pollId,
  options,
  enableCaching = true,
  refreshInterval = 30000, // 30 seconds
}: UseVoteStatsOptions): UseVoteStatsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheKey, setCacheKey] = useState(0);

  // Create optimized vote processor
  const voteProcessor = useMemo(() => 
    createOptimizedVoteProcessor(options), 
    [options, cacheKey]
  );

  // Get vote statistics manager instance
  const statsManager = useMemo(() => 
    VoteStatsManager.getInstance(), 
    []
  );

  // Enhanced stats with caching
  const [cachedStats, setCachedStats] = useState<VoteStatistics | null>(null);
  
  const stats = useMemo(() => {
    if (enableCaching && cachedStats) {
      return cachedStats;
    }
    return voteProcessor.getStats();
  }, [voteProcessor, cachedStats, enableCaching]);

  // Refresh function with caching support
  const refresh = useCallback(async () => {
    if (!enableCaching) {
      // Force recalculation by incrementing cache key
      setCacheKey(prev => prev + 1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const freshStats = await statsManager.getVoteStats(pollId, true);
      setCachedStats(freshStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh vote statistics');
    } finally {
      setIsLoading(false);
    }
  }, [pollId, enableCaching, statsManager]);

  // Auto-refresh effect
  useEffect(() => {
    if (!enableCaching || refreshInterval <= 0) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval, enableCaching]);

  // Initial cache load
  useEffect(() => {
    if (enableCaching) {
      statsManager.getVoteStats(pollId, false)
        .then(setCachedStats)
        .catch(() => {
          // Fallback to local calculation if cache fails
          setCachedStats(null);
        });
    }
  }, [pollId, enableCaching, statsManager]);

  // Convenience methods
  const getVoteCount = useCallback((optionId: string) => 
    voteProcessor.getVoteCount(optionId), 
    [voteProcessor]
  );

  const getPercentage = useCallback((optionId: string) => 
    voteProcessor.getPercentage(optionId), 
    [voteProcessor]
  );

  const isWinning = useCallback((optionId: string) => 
    voteProcessor.isWinning(optionId), 
    [voteProcessor]
  );

  const hasVoter = useCallback((optionId: string, voterId: string) => 
    voteProcessor.hasVoter(optionId, voterId), 
    [voteProcessor]
  );

  return {
    stats,
    isLoading,
    error,
    refresh,
    getVoteCount,
    getPercentage,
    isWinning,
    hasVoter,
  };
}

// Hook for real-time vote updates (for high-traffic polls)
export function useRealTimeVoteStats(pollId: string, options: PollOption[]) {
  const [liveStats, setLiveStats] = useState<VoteStatistics | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // In a real implementation, this would use Supabase real-time subscriptions
  useEffect(() => {
    // TODO: Implement Supabase real-time subscription
    // const subscription = supabase
    //   .from('votes')
    //   .on('*', (payload) => {
    //     if (payload.new?.poll_id === pollId) {
    //       // Refresh stats when votes change
    //       const processor = createOptimizedVoteProcessor(options);
    //       setLiveStats(processor.getStats());
    //     }
    //   })
    //   .subscribe();

    // For now, use regular polling for high-frequency updates
    const interval = setInterval(() => {
      const processor = createOptimizedVoteProcessor(options);
      setLiveStats(processor.getStats());
    }, 5000); // 5 second updates for real-time feel

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      // subscription?.unsubscribe();
      setIsConnected(false);
    };
  }, [pollId, options]);

  return {
    stats: liveStats,
    isConnected,
  };
}
