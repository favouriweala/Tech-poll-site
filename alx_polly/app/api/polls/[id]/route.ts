
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/polls/[id] - Retrieves a single poll with results
export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params
  const pollId = resolvedParams.id

  try {
    const supabase = await createServerSupabaseClient()

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
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    const { data: pollResults, error: resultsError } = await supabase
      .from('poll_results')
      .select('option_id, option_text, order_index, vote_count, vote_percentage')
      .eq('poll_id', pollId)
      .order('order_index', { ascending: true })

    if (resultsError) {
      console.error('Error fetching poll results:', resultsError)
      return NextResponse.json({ ...poll, options: [] })
    }

    const optionsWithStats = (pollResults || []).map(result => ({
      option_id: result.option_id,
      option_text: result.option_text,
      order_index: result.order_index,
      vote_count: result.vote_count || 0,
      vote_percentage: result.vote_percentage || 0
    }))

    const pollWithResults = {
      ...poll,
      options: optionsWithStats
    }

    return NextResponse.json(pollWithResults)

  } catch (error) {
    console.error(`Error in GET /api/polls/${pollId}:`, error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

// DELETE /api/polls/[id] - Deletes a poll
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params
  const pollId = resolvedParams.id

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to delete a poll' }, { status: 401 })
    }

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (poll.created_by !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own polls' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)

    if (deleteError) {
      console.error('Error deleting poll:', deleteError)
      return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 })
    }

    revalidatePath('/polls')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(`Error in DELETE /api/polls/${pollId}:`, error)
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
