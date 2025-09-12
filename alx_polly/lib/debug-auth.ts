// Debug utility to check authentication status
'use server'

import { createServerSupabaseClient } from './supabase-server'

export async function debugAuth() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('=== AUTH DEBUG ===')
    console.log('User:', user ? { id: user.id, email: user.email } : null)
    console.log('User Error:', userError)
    console.log('Session:', session ? { access_token: session.access_token?.substring(0, 20) + '...', expires_at: session.expires_at } : null)
    console.log('Session Error:', sessionError)
    console.log('================')
    
    return {
      user: user ? { id: user.id, email: user.email } : null,
      hasSession: !!session,
      userError: userError?.message,
      sessionError: sessionError?.message
    }
  } catch (error) {
    console.error('Debug auth error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
