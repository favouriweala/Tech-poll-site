'use client';

/**
 * PollVotingForm Component
 * 
 * WHAT: Interactive voting interface that allows users to cast votes on poll options
 * with adaptive behavior for single-choice vs multiple-choice polls.
 * 
 * WHY: A dedicated voting component is essential because:
 * 1. Voting is the core interaction in a polling application
 * 2. Different poll types (single vs multiple choice) require different UI behavior
 * 3. Real-time validation prevents user errors and improves experience
 * 4. Loading states provide feedback during network operations
 * 5. Accessibility ensures all users can participate in voting
 * 6. Error handling guides users through voting issues
 * 
 * HOW: Uses React state and transitions for smooth user experience:
 * - useState manages selected options with different logic per poll type
 * - useTransition provides loading states without blocking UI
 * - Form validation prevents submission of invalid selections
 * - Server actions handle vote submission with proper error handling
 * - Accessible radio/checkbox inputs ensure proper keyboard navigation
 * 
 * Features:
 * - Single and multiple selection support
 * - Real-time form validation
 * - Optimistic UI updates with loading states
 * - Error handling and user feedback
 * - Accessible form controls (radio/checkbox)
 * - Prevents duplicate submissions
 * 
 * @component
 */

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { submitVote } from '@/lib/actions';

/** Represents a poll option with voting statistics */
interface PollOption {
  option_id: string;
  option_text: string;
  order_index: number;
  vote_count: number;
  vote_percentage: number;
}

/** Complete poll data structure for voting */
interface Poll {
  id: string;
  title: string;
  description?: string;
  allow_multiple_selections: boolean;
  options: PollOption[];
}

/** Props for the PollVotingForm component */
interface PollVotingFormProps {
  /** Poll data containing options and settings */
  poll: Poll;
  /** Optional authenticated user ID */
  userId?: string;
  /** Whether multiple selections are allowed */
  allowMultiple: boolean;
}

/**
 * PollVotingForm Component Implementation
 * 
 * Renders an interactive voting form that adapts to poll settings (single/multiple choice).
 * Handles vote submission with proper error handling and loading states.
 * 
 * @param poll - Poll data with options and settings
 * @param userId - Optional authenticated user ID for vote attribution
 * @param allowMultiple - Whether multiple option selection is allowed
 * @returns React component for poll voting interface
 */
export default function PollVotingForm({ poll, userId, allowMultiple }: PollVotingFormProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  /**
   * Handles option selection/deselection based on poll type
   * 
   * WHY: Different poll types require different selection logic:
   * - Single choice polls should replace the current selection (radio behavior)
   * - Multiple choice polls should toggle selections (checkbox behavior)
   * - This prevents user confusion and ensures correct voting behavior
   */
  const handleOptionChange = (optionId: string) => {
    if (allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  /**
   * Handles vote submission with validation and error handling
   * 
   * WHY: Comprehensive vote submission handling is crucial because:
   * - Client-side validation prevents unnecessary server requests
   * - Loading states inform users that their vote is being processed
   * - Error handling provides clear feedback for voting issues
   * - Multiple option submission requires proper sequencing for multiple-choice polls
   */
  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      setError('Please select at least one option');
      return;
    }

    setError('');
    
    startTransition(async () => {
      try {
        // Submit votes for all selected options
        for (const optionId of selectedOptions) {
          const result = await submitVote(poll.id, optionId, userId);
          
          if (!result.success) {
            setError(result.error);
            return;
          }
        }
        // Page will be revalidated and show results
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit vote');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">
          {allowMultiple ? 'Select one or more options:' : 'Select one option:'}
        </h3>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {poll.options.map((option) => (
          <div 
            key={option.option_id} 
            className="flex items-center p-6 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => !isPending && handleOptionChange(option.option_id)}
          >
            <input
              type={allowMultiple ? 'checkbox' : 'radio'}
              name={allowMultiple ? 'poll-options' : 'poll-option'}
              value={option.option_id}
              checked={selectedOptions.includes(option.option_id)}
              onChange={() => handleOptionChange(option.option_id)}
              className="mr-4 h-5 w-5 text-blue-600"
              disabled={isPending}
            />
            <span className="font-bold text-xl text-black flex-1">
              {option.option_text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0 || isPending}
          className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-bold min-w-[150px]"
        >
          {isPending ? 'Submitting...' : 'Submit Vote'}
        </Button>
      </div>

      {allowMultiple && (
        <p className="text-sm text-gray-600 text-center">
          You can select multiple options for this poll
        </p>
      )}
    </div>
  );
}
