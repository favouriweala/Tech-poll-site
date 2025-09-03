'use server'

import { createServerSupabaseClient } from './supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface PollOption {
  text: string
}

export interface PollData {
  title: string
  description?: string
  options: PollOption[]
  allowMultipleSelections: boolean
  isPublic: boolean
  endDate?: string
}

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

// Get all public polls with basic statistics
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

// Get polls created by a specific user
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

// Get a single poll with its options and results (OPTIMIZED)
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

// Submit a vote on a poll
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

// Check if user has voted on a poll
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

// Get user's votes for a specific poll
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

// Delete a poll (only by creator)
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