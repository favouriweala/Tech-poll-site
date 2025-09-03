// Optimized vote calculation utilities
import { PollOption } from './types';

// Pre-computed vote statistics interface
export interface VoteStatistics {
  totalVotes: number;
  uniqueVoters: number;
  maxVotes: number;
  winningOptions: string[];
  percentages: Record<string, number>;
}

// Efficient vote statistics calculator
export class VoteStatsCalculator {
  private stats: VoteStatistics | null = null;
  private lastCalculated = 0;
  private readonly CACHE_DURATION = 1000; // 1 second cache

  constructor(private options: PollOption[]) {}

  // Get pre-calculated statistics with caching
  getStatistics(forceRefresh = false): VoteStatistics {
    const now = Date.now();
    
    if (!forceRefresh && this.stats && (now - this.lastCalculated) < this.CACHE_DURATION) {
      return this.stats;
    }

    this.stats = this.calculateStatistics();
    this.lastCalculated = now;
    return this.stats;
  }

  // Optimized statistics calculation
  private calculateStatistics(): VoteStatistics {
    let totalVotes = 0;
    let maxVotes = 0;
    const voteCounts: Record<string, number> = {};
    const uniqueVotersSet = new Set<string>();

    // Single pass through options for all calculations
    for (const option of this.options) {
      const voteCount = option.vote_count || 0;
      voteCounts[option.option_id] = voteCount;
      totalVotes += voteCount;
      maxVotes = Math.max(maxVotes, voteCount);

      // Collect unique voters if available
      if (option.voters) {
        option.voters.forEach(voter => uniqueVotersSet.add(voter));
      }
    }

    // Calculate percentages
    const percentages: Record<string, number> = {};
    if (totalVotes > 0) {
      for (const [optionId, count] of Object.entries(voteCounts)) {
        percentages[optionId] = Math.round((count / totalVotes) * 100);
      }
    }

    // Find winning options
    const winningOptions = maxVotes > 0 
      ? this.options
          .filter(option => (option.vote_count || 0) === maxVotes)
          .map(option => option.option_id)
      : [];

    return {
      totalVotes,
      uniqueVoters: uniqueVotersSet.size,
      maxVotes,
      winningOptions,
      percentages,
    };
  }

  // Check if option is winning
  isWinning(optionId: string): boolean {
    return this.getStatistics().winningOptions.includes(optionId);
  }

  // Get percentage for specific option
  getPercentage(optionId: string): number {
    return this.getStatistics().percentages[optionId] || 0;
  }

  // Get vote count for specific option (O(1) lookup)
  getVoteCount(optionId: string): number {
    const option = this.options.find(opt => opt.option_id === optionId);
    return option?.vote_count || 0;
  }
}

// Optimized vote lookup using Map for O(1) access
export class VoteLookup {
  private readonly voteMap: Map<string, number>;
  private readonly voterMap: Map<string, Set<string>>;

  constructor(options: PollOption[]) {
    this.voteMap = new Map();
    this.voterMap = new Map();

    // Build lookup maps once
    for (const option of options) {
      this.voteMap.set(option.option_id, option.vote_count || 0);
      this.voterMap.set(option.option_id, new Set(option.voters || []));
    }
  }

  // O(1) vote count lookup
  getVoteCount(optionId: string): number {
    return this.voteMap.get(optionId) || 0;
  }

  // O(1) voter check
  hasVoter(optionId: string, voterId: string): boolean {
    return this.voterMap.get(optionId)?.has(voterId) || false;
  }

  // Get all voters for an option
  getVoters(optionId: string): string[] {
    return Array.from(this.voterMap.get(optionId) || []);
  }

  // Fast total calculation
  getTotalVotes(): number {
    let total = 0;
    for (const count of this.voteMap.values()) {
      total += count;
    }
    return total;
  }

  // Fast unique voters count
  getUniqueVotersCount(): number {
    const allVoters = new Set<string>();
    for (const voters of this.voterMap.values()) {
      for (const voter of voters) {
        allVoters.add(voter);
      }
    }
    return allVoters.size;
  }
}

// Utility for efficient batch vote operations
export function createOptimizedVoteProcessor(options: PollOption[]) {
  const calculator = new VoteStatsCalculator(options);
  const lookup = new VoteLookup(options);

  return {
    calculator,
    lookup,
    // Convenience methods
    getStats: () => calculator.getStatistics(),
    getVoteCount: (optionId: string) => lookup.getVoteCount(optionId),
    getPercentage: (optionId: string) => calculator.getPercentage(optionId),
    isWinning: (optionId: string) => calculator.isWinning(optionId),
    hasVoter: (optionId: string, voterId: string) => lookup.hasVoter(optionId, voterId),
  };
}
