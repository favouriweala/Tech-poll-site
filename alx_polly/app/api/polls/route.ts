
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { PollCreationSchema } from '@/lib/validation-utils'
import { ApiResponse } from '@/lib/types'
import { z } from 'zod'

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
      const response: ApiResponse = { success: false, error: 'Poll title is required', statusCode: 400 };
      return NextResponse.json(response, { status: 400 });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      const response: ApiResponse = { success: false, error: 'At least 2 poll options are required', statusCode: 400 };
      return NextResponse.json(response, { status: 400 });
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const response: ApiResponse = { success: false, error: 'You must be logged in to create a poll', statusCode: 401 };
      return NextResponse.json(response, { status: 401 });
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
      console.error('Error creating poll:', pollError);
      const response: ApiResponse = { success: false, error: 'Failed to create poll', statusCode: 500 };
      return NextResponse.json(response, { status: 500 });
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
      console.error('Error creating poll options:', optionsError);
      await supabase.from('polls').delete().eq('id', poll.id);
      const response: ApiResponse = { success: false, error: 'Failed to create poll options', statusCode: 500 };
      return NextResponse.json(response, { status: 500 });
    }

    revalidatePath('/polls');
    const response: ApiResponse<{ pollId: string }> = { success: true, data: { pollId: poll.id }, statusCode: 201 };
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/polls:', error);
    const response: ApiResponse = { success: false, error: 'An unexpected error occurred', statusCode: 500 };
    return NextResponse.json(response, { status: 500 });
  }
}
