
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

 interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/polls/[id]/votes - Retrieves user's votes for a poll
export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params
  const pollId = resolvedParams.id

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error getting user votes:', error)
      return NextResponse.json({ error: 'Failed to get user votes' }, { status: 500 })
    }

    return NextResponse.json((data || []).map(vote => vote.option_id))

  } catch (error) {
    console.error(`Error in GET /api/polls/${pollId}/votes:`, error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
