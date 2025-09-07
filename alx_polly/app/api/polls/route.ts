
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/polls - Retrieves public polls or user-specific polls
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  try {
    const supabase = await createServerSupabaseClient()
    let query = supabase
      .from('poll_stats')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('created_by', userId)
    } else {
      query = query.eq('is_public', true).eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching polls:', error)
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/polls:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

// POST /api/polls - Creates a new poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, options, allowMultipleSelections, isPublic, endDate } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Poll title is required' }, { status: 400 })
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'At least 2 poll options are required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to create a poll' }, { status: 401 })
    }

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
    }

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
      return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
    }

    const optionsToInsert = options.map((text: string, index: number) => ({
      poll_id: poll.id,
      text: text.trim(),
      order_index: index
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      await supabase.from('polls').delete().eq('id', poll.id)
      return NextResponse.json({ error: 'Failed to create poll options' }, { status: 500 })
    }

    revalidatePath('/polls')
    return NextResponse.json({ success: true, pollId: poll.id }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/polls:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
