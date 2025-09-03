// Vote caching and optimization utilities
'use client';

import { createServerSupabaseClient } from './supabase-server';

// Cache structure for vote statistics
interface VoteStatsCache {
  [pollId: string]: {
    totalVotes: number;
    uniqueVoters: number;
    optionStats: Record<string, number>;
    lastUpdated: number;
    expiresAt: number;
  };
}

// In-memory cache (in production, use Redis)
const voteCache: VoteStatsCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REAL_TIME_THRESHOLD = 100; // Switch to real-time below this vote count

export class VoteStatsManager {
  private static instance: VoteStatsManager;
  
  static getInstance(): VoteStatsManager {
    if (!VoteStatsManager.instance) {
      VoteStatsManager.instance = new VoteStatsManager();
    }
    return VoteStatsManager.instance;
  }

  // Get vote statistics with intelligent caching
  async getVoteStats(pollId: string, forceRefresh = false): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    optionStats: Record<string, number>;
  }> {
    const now = Date.now();
    const cached = voteCache[pollId];

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && cached && now < cached.expiresAt) {
      return {
        totalVotes: cached.totalVotes,
        uniqueVoters: cached.uniqueVoters,
        optionStats: cached.optionStats,
      };
    }

    // Fetch fresh data from database
    const stats = await this.fetchVoteStatsFromDB(pollId);
    
    // Cache the results
    voteCache[pollId] = {
      ...stats,
      lastUpdated: now,
      expiresAt: now + CACHE_TTL,
    };

    return stats;
  }

  // Fetch optimized vote statistics from database
  private async fetchVoteStatsFromDB(pollId: string): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    optionStats: Record<string, number>;
  }> {
    const supabase = await createServerSupabaseClient();

    // Use optimized aggregation query instead of fetching all votes
    const { data: pollStats } = await supabase
      .from('poll_stats')
      .select('total_votes, unique_voters')
      .eq('id', pollId)
      .single();

    // Get vote counts per option using efficient aggregation
    const { data: optionVotes } = await supabase
      .from('poll_results')
      .select('option_id, vote_count')
      .eq('poll_id', pollId);

    const optionStats: Record<string, number> = {};
    optionVotes?.forEach(option => {
      optionStats[option.option_id] = option.vote_count || 0;
    });

    return {
      totalVotes: pollStats?.total_votes || 0,
      uniqueVoters: pollStats?.unique_voters || 0,
      optionStats,
    };
  }

  // Invalidate cache when votes are submitted
  invalidateCache(pollId: string): void {
    delete voteCache[pollId];
  }

  // Batch invalidate multiple polls
  invalidateMultiple(pollIds: string[]): void {
    pollIds.forEach(id => this.invalidateCache(id));
  }

  // Get cache statistics for monitoring
  getCacheStats(): {
    totalCached: number;
    averageAge: number;
    hitRate: number;
  } {
    const entries = Object.values(voteCache);
    const now = Date.now();
    
    return {
      totalCached: entries.length,
      averageAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (now - entry.lastUpdated), 0) / entries.length 
        : 0,
      hitRate: 0 // Would need to track hits/misses in production
    };
  }
}
