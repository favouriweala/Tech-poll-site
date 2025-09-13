
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { pollUpdateEmitter } from '@/lib/events';

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/polls/[id]/vote - Submits a vote
export async function POST(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params
  const pollId = resolvedParams.id

  try {
    const body = await request.json()
    const { optionId } = body

    if (!optionId) {
      return NextResponse.json({ error: 'Option ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    const canVote = await supabase.rpc('can_vote_on_poll', {
      poll_uuid: pollId,
      user_uuid: userId || null
    })

    if (!canVote.data) {
      return NextResponse.json({ error: 'You cannot vote on this poll at this time' }, { status: 403 })
    }

    let voterIp = null
    if (!userId) {
      voterIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    }

    const { data: poll } = await supabase
      .from('polls')
      .select('allow_multiple_selections')
      .eq('id', pollId)
      .single()

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (!poll.allow_multiple_selections && userId) {
      await supabase
        .from('votes')
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', userId)
    }

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
      return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
    }

    revalidatePath(`/polls/${pollId}`)
    pollUpdateEmitter.emit(`update-${pollId}`);
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(`Error in POST /api/polls/${pollId}/vote:`, error)
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
