'use client';
/**
 * PollResults component displays the results of a poll.
 * @param poll - The poll object containing the poll details.
 * @param userVotes - An array of user vote IDs.
 * @param showVotes - A boolean indicating whether to show the votes.
 * @returns A React component displaying the poll results.
 */

import { useMemo, memo } from 'react';
import { createOptimizedVoteProcessor } from '@/lib/vote-utils';

interface PollOption {
  option_id: string;
  option_text: string;
  order_index: number;
  vote_count: number;
  vote_percentage: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  allow_multiple_selections: boolean;
  options: PollOption[];
}

interface PollResultsProps {
  poll: Poll;
  userVotes: string[];
  showVotes: boolean;
}

const PollResults = memo(function PollResults({ poll, userVotes, showVotes }: PollResultsProps) {
  // OPTIMIZED: Use efficient vote processor instead of repeated array operations
  const voteProcessor = useMemo(() => 
    createOptimizedVoteProcessor(poll.options), 
    [poll.options]
  );
  
  const { totalVotes, maxVotes } = voteProcessor.getStats();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">Poll Results</h3>

        {poll.options.map((option) => {
          // OPTIMIZED: Use pre-calculated values from vote processor
          const voteCount = voteProcessor.getVoteCount(option.option_id);
          const percentage = voteProcessor.getPercentage(option.option_id);
          const isUserChoice = userVotes.includes(option.option_id);
          const isWinning = voteProcessor.isWinning(option.option_id);

          return (
            <div 
              key={option.option_id}
              className={`p-6 border rounded-lg transition-all ${
                isUserChoice 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-white'
              } ${isWinning ? 'ring-2 ring-green-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="font-bold text-xl text-black mr-3">
                    {option.option_text}
                  </span>
                  {isUserChoice && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Your choice
                    </span>
                  )}
                  {isWinning && totalVotes > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                      Leading
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {showVotes ? `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}` : '•••'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {showVotes ? `${percentage}%` : '•••'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {showVotes && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isUserChoice ? 'bg-blue-500' : isWinning ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              )}
              
              {!showVotes && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {showVotes ? totalVotes : '•••'}
          </div>
          <div className="text-sm text-gray-600">
            Total {totalVotes === 1 ? 'Vote' : 'Votes'}
          </div>
          {userVotes.length > 0 && (
            <div className="mt-2 text-sm text-blue-600 font-medium">
              Thank you for voting!
            </div>
          )}
        </div>
      </div>

      {!showVotes && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Vote to see the results, or wait until the poll ends.
          </p>
        </div>
      )}
    </div>
  );
});

export default PollResults;
