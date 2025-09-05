'use server'

/**
 * Server Actions for ALX Polly Poll Management System
 * 
 * WHAT: This module contains all server-side actions for managing polls, votes, and related
 * operations in the ALX Polly application. All functions run on the server using Next.js
 * Server Actions and utilize Supabase for database operations.
 * 
 * WHY: Server Actions are used instead of API routes because:
 * 1. Better security - no exposed API endpoints that can be called directly
 * 2. Type safety - direct function calls with TypeScript support
 * 3. Simplified data fetching - no need for fetch() calls or error handling
 * 4. Better performance - direct server execution without HTTP overhead
 * 5. Built-in CSRF protection and form handling
 * 
 * HOW: Uses Next.js 'use server' directive to mark functions as server actions:
 * - Functions execute on the server with full database access
 * - Authentication is verified using Supabase server client
 * - Database operations use Row Level Security (RLS) for additional protection
 * - Form data is processed and validated before database operations
 * - Optimistic updates are supported through revalidatePath() calls
 * 
 * Key Features:
 * - Full CRUD operations for polls and poll options
 * - Vote submission with duplicate prevention
 * - User authentication verification
 * - Database transaction safety with rollback capabilities
 * - Performance-optimized queries using database views
 * - Row Level Security (RLS) enforcement
 * 
 * @module actions
 */

import { createServerSupabaseClient } from './supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/** Represents a single poll option with its text content */
export interface PollOption {
  text: string
}

/** Complete poll data structure for poll creation and management */
export interface PollData {
  title: string
  description?: string
  options: PollOption[]
  allowMultipleSelections: boolean
  isPublic: boolean
  endDate?: string
}

/**
 * Creates a new poll with options in the database
 * 
 * WHAT: Handles the complete poll creation process from form submission to database storage.
 * Processes FormData, validates input, creates poll and options records, and redirects user.
 * 
 * WHY: This function is necessary because:
 * 1. Poll creation requires multiple database operations (poll + options) that must be atomic
 * 2. Form data needs validation and sanitization before database insertion
 * 3. User authentication must be verified for security
 * 4. Profile creation ensures referential integrity for poll ownership
 * 5. Server-side processing prevents client-side manipulation of poll data
 * 
 * HOW: Multi-step process with rollback capabilities:
 * 1. Extract and validate form data (title, options, settings)
 * 2. Verify user authentication and create/update profile if needed
 * 3. Insert poll record into database
 * 4. Insert all poll options with proper ordering
 * 5. Clean up on failure (delete poll if options insertion fails)
 * 6. Revalidate cache and redirect to polls page
 * 
 * @param formData - FormData object containing poll information:
 *   - title: Poll title (required)
 *   - description: Poll description (optional)
 *   - option-* or option0-9: Poll options (minimum 2 required)
 *   - allowMultipleSelections: Whether multiple selections are allowed
 *   - isPublic: Whether the poll is public or private
 *   - endDate: Optional end date for the poll
 * 
 * @throws Error if user is not authenticated
 * @throws Error if title is missing or empty
 * @throws Error if less than 2 poll options are provided
 * @throws Error if database operations fail
 * 
 * @returns Promise<void> - Redirects to polls page on success
 * 
 * @example
 * ```tsx
 * // In a form component
 * <form action={createPoll}>
 *   <input name="title" placeholder="Poll title" />
 *   <input name="option-0" placeholder="Option 1" />
 *   <input name="option-1" placeholder="Option 2" />
 *   <button type="submit">Create Poll</button>
 * </form>
 * ```
 */
export async function createPoll(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  
  // Validate required fields
  if (!title || title.trim().length === 0) {
    throw new Error('Poll title is required')
  }
  
  // Get all options from the form data
  const options = []
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && value.trim() !== '' && key.startsWith('option-')) {
      options.push(value.trim())
    }
  }
  
  // If no options were found in the form data, try alternative extraction
  if (options.length === 0) {
    for (let i = 0; i < 10; i++) {
      const option = formData.get(`option${i}`)
      if (option && typeof option === 'string' && option.trim() !== '') {
        options.push(option.trim())
      }
    }
  }
  
  // Validate options
  if (options.length < 2) {
    throw new Error('At least 2 poll options are required')
  }
  
  const allowMultipleSelections = formData.get('allowMultipleSelections') === 'on'
  const isPublic = formData.get('isPublic') === 'on'
  const endDate = formData.get('endDate') as string || null
  
  try {
    // Create server-side Supabase client
    const supabase = await createServerSupabaseClient()
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('You must be logged in to create a poll')
    }
    
    // Ensure user profile exists (create if doesn't exist)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      }, {
        onConflict: 'id'
      })
    
    if (profileError) {
      console.error('Error ensuring profile exists:', profileError)
      // Continue anyway - the profile might already exist
    }
    
    // First, insert the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        allow_multiple_selections: allowMultipleSelections,
        is_public: isPublic,
        end_date: endDate || null,
        created_by: user.id
      })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      throw new Error('Failed to create poll. Please try again.')
    }

    // Then, insert all options with proper ordering
    const optionsToInsert = options.map((text, index) => ({
      poll_id: poll.id,
      text: text.trim(),
      order_index: index
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      // Clean up the poll if options failed to insert
      await supabase.from('polls').delete().eq('id', poll.id)
      throw new Error('Failed to create poll options. Please try again.')
    }
    
    console.log('Poll created successfully:', poll.id)
    revalidatePath('/polls')
    redirect('/polls?success=true')
    
  } catch (error) {
    console.error('Error in createPoll:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred while creating the poll')
  }
}

/**
 * Retrieves all public polls with aggregated statistics
 * 
 * Fetches public, active polls using the optimized poll_stats database view
 * for improved performance. Returns polls ordered by creation date (newest first).
 * 
 * @returns Promise<PollStats[]> - Array of public polls with statistics
 * 
 * Features:
 * - Uses database view for performance optimization
 * - Only returns public and active polls
 * - Includes vote counts and other statistics
 * - Graceful error handling with empty array fallback
 * 
 * @example
 * ```tsx
 * const publicPolls = await getPublicPolls()
 * console.log(`Found ${publicPolls.length} public polls`)
 * ```
 */
export async function getPublicPolls() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('poll_stats')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching polls:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getPublicPolls:', error)
    return []
  }
}

/**
 * Retrieves all polls created by a specific user
 * 
 * Fetches user's polls with aggregated statistics using the poll_stats view.
 * Returns all polls (public and private) created by the specified user.
 * 
 * @param userId - UUID of the user whose polls to retrieve
 * @returns Promise<PollStats[]> - Array of user's polls with statistics
 * 
 * Features:
 * - Returns both public and private polls for the user
 * - Includes comprehensive poll statistics
 * - Ordered by creation date (newest first)
 * - Graceful error handling
 * 
 * @example
 * ```tsx
 * const userPolls = await getUserPolls(user.id)
 * const activePollsCount = userPolls.filter(poll => poll.is_active).length
 * ```
 */
export async function getUserPolls(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('poll_stats')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user polls:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserPolls:', error)
    return []
  }
}

/**
 * Retrieves a single poll with its options and vote results (Performance Optimized)
 * 
 * Fetches complete poll data including options and voting statistics using
 * optimized database views instead of N+1 queries. This function provides
 * all data needed for poll display and voting interfaces.
 * 
 * @param pollId - UUID of the poll to retrieve
 * @returns Promise<PollWithResults | null> - Complete poll data with results, null if not found
 * 
 * Performance Features:
 * - Uses poll_results database view for aggregated statistics
 * - Single query instead of multiple joins
 * - Pre-calculated vote counts and percentages
 * - Optimized for polls with thousands of votes
 * 
 * Data Included:
 * - Poll metadata (title, description, settings, creator info)
 * - All poll options with vote counts and percentages
 * - Proper ordering of options
 * 
 * @example
 * ```tsx
 * const poll = await getPollWithResults(pollId)
 * if (poll) {
 *   console.log(`${poll.title} has ${poll.options.length} options`)
 *   poll.options.forEach(option => {
 *     console.log(`${option.option_text}: ${option.vote_count} votes`)
 *   })
 * }
 * ```
 */
export async function getPollWithResults(pollId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get poll details
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        *,
        profiles:created_by(id, full_name, email)
      `)
      .eq('id', pollId)
      .single()

    if (pollError || !poll) {
      console.error('Error fetching poll:', pollError)
      return null
    }

    // OPTIMIZED: Use database view for aggregated results instead of fetching all votes
    const { data: pollResults, error: resultsError } = await supabase
      .from('poll_results')
      .select('option_id, option_text, order_index, vote_count, vote_percentage')
      .eq('poll_id', pollId)
      .order('order_index', { ascending: true })

    if (resultsError) {
      console.error('Error fetching poll results:', resultsError)
      return { ...poll, options: [] }
    }

    // Transform to expected format
    const optionsWithStats = (pollResults || []).map(result => ({
      option_id: result.option_id,
      option_text: result.option_text,
      order_index: result.order_index,
      vote_count: result.vote_count || 0,
      vote_percentage: result.vote_percentage || 0
    }))

    return {
      ...poll,
      options: optionsWithStats
    }
  } catch (error) {
    console.error('Error in getPollWithResults:', error)
    return null
  }
}

/**
 * Submits a vote on a poll option with comprehensive validation
 * 
 * WHAT: Processes and records a user's vote on a specific poll option, handling both
 * authenticated and anonymous voting with proper validation and duplicate prevention.
 * 
 * WHY: This function is essential because:
 * 1. Voting must be validated to prevent fraud and duplicate votes
 * 2. Different poll types (single vs multiple choice) require different logic
 * 3. Anonymous voting needs IP tracking for duplicate prevention
 * 4. Database constraints and RLS policies need server-side enforcement
 * 5. Real-time updates require cache invalidation after vote submission
 * 
 * HOW: Multi-step validation and insertion process:
 * 1. Check voting eligibility using database RPC function
 * 2. Handle anonymous voting with IP address tracking
 * 3. For single-choice polls: remove existing votes before adding new one
 * 4. For multiple-choice polls: allow additional votes on different options
 * 5. Insert new vote record with proper user/IP association
 * 6. Revalidate poll page cache to show updated results
 * 
 * @param pollId - UUID of the poll to vote on
 * @param optionId - UUID of the poll option being voted for
 * @param userId - Optional UUID of the authenticated user (undefined for anonymous)
 * 
 * @returns Promise<{success: boolean}> - Success status object
 * 
 * @throws Error if user cannot vote on this poll
 * @throws Error if poll is not found
 * @throws Error if vote submission fails
 * 
 * @example
 * ```tsx
 * // Authenticated user voting
 * await submitVote(pollId, optionId, user.id)
 * 
 * // Anonymous voting
 * await submitVote(pollId, optionId)
 * ```
 */
export async function submitVote(pollId: string, optionId: string, userId?: string) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if user can vote on this poll
    const canVote = await supabase.rpc('can_vote_on_poll', {
      poll_uuid: pollId,
      user_uuid: userId || null
    })

    if (!canVote.data) {
      throw new Error('You cannot vote on this poll at this time')
    }

    // Get user's IP for anonymous voting
    let voterIp = null
    if (!userId) {
      // In a real implementation, you'd get the actual IP address
      // For now, we'll use a placeholder
      voterIp = '127.0.0.1'
    }

    // Check if poll allows multiple selections
    const { data: poll } = await supabase
      .from('polls')
      .select('allow_multiple_selections')
      .eq('id', pollId)
      .single()

    if (!poll) {
      throw new Error('Poll not found')
    }

    // If single selection and user already voted, delete existing vote
    if (!poll.allow_multiple_selections && userId) {
      await supabase
        .from('votes')
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', userId)
    }

    // Insert the new vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId || null,
        voter_ip: voterIp
      })

    if (voteError) {
      console.error('Error submitting vote:', voteError)
      throw new Error('Failed to submit vote. Please try again.')
    }

    revalidatePath(`/polls/${pollId}`)
    return { success: true }
  } catch (error) {
    console.error('Error in submitVote:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred while submitting your vote')
  }
}

/**
 * Checks if a user has voted on a specific poll
 * 
 * Determines whether the authenticated user has already cast votes
 * on the specified poll. Returns false for anonymous users.
 * 
 * @param pollId - UUID of the poll to check
 * @param userId - Optional UUID of the user (returns false if undefined)
 * @returns Promise<boolean> - True if user has voted, false otherwise
 * 
 * @example
 * ```tsx
 * const hasVoted = await hasUserVoted(pollId, user?.id)
 * if (hasVoted) {
 *   // Show results instead of voting form
 * }
 * ```
 */
export async function hasUserVoted(pollId: string, userId?: string) {
  if (!userId) return false

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error checking user vote:', error)
      return false
    }

    return (data || []).length > 0
  } catch (error) {
    console.error('Error in hasUserVoted:', error)
    return false
  }
}

/**
 * Retrieves all vote option IDs that a user has voted for on a specific poll
 * 
 * Returns an array of option IDs that the user has voted for, useful for
 * showing which options are selected in the UI and handling multiple-choice polls.
 * 
 * @param pollId - UUID of the poll to get votes for
 * @param userId - Optional UUID of the user (returns empty array if undefined)
 * @returns Promise<string[]> - Array of option IDs the user voted for
 * 
 * @example
 * ```tsx
 * const userVotes = await getUserVotes(pollId, user?.id)
 * // Use to show selected options in UI
 * options.forEach(option => {
 *   const isSelected = userVotes.includes(option.id)
 *   // Render with selection state
 * })
 * ```
 */
export async function getUserVotes(pollId: string, userId?: string) {
  if (!userId) return []

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error getting user votes:', error)
      return []
    }

    return (data || []).map(vote => vote.option_id)
  } catch (error) {
    console.error('Error in getUserVotes:', error)
    return []
  }
}

/**
 * Deletes a poll and all associated data (Creator Authorization Required)
 * 
 * Permanently removes a poll and all related data including options and votes.
 * Only the poll creator can delete their own polls. Uses database cascade
 * deletion to ensure all related records are properly cleaned up.
 * 
 * @param pollId - UUID of the poll to delete
 * @returns Promise<{success: boolean}> - Success status object
 * 
 * @throws Error if user is not authenticated
 * @throws Error if poll is not found
 * @throws Error if user is not the poll creator
 * @throws Error if deletion fails
 * 
 * Security Features:
 * - Verifies user authentication
 * - Validates poll ownership before deletion
 * - Uses database cascade for complete cleanup
 * - Revalidates related pages after deletion
 * 
 * @example
 * ```tsx
 * try {
 *   await deletePoll(pollId)
 *   // Poll successfully deleted
 * } catch (error) {
 *   // Handle deletion error
 * }
 * ```
 */
export async function deletePoll(pollId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('You must be logged in to delete a poll')
    }

    // Verify the user owns this poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single()

    if (pollError || !poll) {
      throw new Error('Poll not found')
    }

    if (poll.created_by !== user.id) {
      throw new Error('You can only delete your own polls')
    }

    // Delete the poll (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)

    if (deleteError) {
      console.error('Error deleting poll:', deleteError)
      throw new Error('Failed to delete poll. Please try again.')
    }

    revalidatePath('/polls')
    return { success: true }
  } catch (error) {
    console.error('Error in deletePoll:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred while deleting the poll')
  }
}