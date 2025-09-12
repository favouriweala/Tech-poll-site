/**
 * Enhanced Supabase Server Client Configuration
 * 
 * This module provides a secure server-side Supabase client with enhanced
 * error handling, validation, and security measures for server-side operations.
 * 
 * Security Features:
 * - Environment variable validation
 * - Secure cookie handling with proper options
 * - Enhanced error handling and logging
 * - Request context validation
 * - Session security measures
 * 
 * @fileoverview Secure Supabase server client configuration
 * @version 2.0.0
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Validates required environment variables for server-side operations
 * @throws Error if required environment variables are missing or invalid
 */
function validateServerEnvironment(): void {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    
    // Validate Supabase URL format
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      try {
        const url = new URL(value)
        if (url.protocol !== 'https:') {
          throw new Error('Supabase URL must use HTTPS protocol')
        }
        if (!url.hostname.includes('supabase')) {
          console.warn('Warning: Supabase URL does not appear to be a valid Supabase endpoint')
        }
      } catch (error) {
        throw new Error(`Invalid Supabase URL format: ${value}`)
      }
    }
    
    // Validate anonymous key format (basic check)
    if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && value.length < 100) {
      console.warn('Warning: Supabase anonymous key appears to be unusually short')
    }
  }
}

/**
 * Creates a secure server-side Supabase client with enhanced security
 * 
 * @returns Configured Supabase client for server-side operations
 * @throws Error if environment variables are invalid or client creation fails
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  try {
    validateServerEnvironment()
    
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Enhanced server-side auth configuration
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // Disable for server-side
          flowType: 'pkce'
        },
        cookies: {
          getAll() {
            try {
              return cookieStore.getAll()
            } catch (error) {
              console.error('Error reading cookies:', error)
              return []
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // Enhanced cookie security options
                const secureOptions = {
                  httpOnly: true, // Prevent XSS attacks
                  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                  sameSite: 'lax' as const, // CSRF protection
                  path: '/',
                  maxAge: 60 * 60 * 24 * 7, // 7 days
                  ...options
                }
                
                cookieStore.set(name, value, secureOptions)
              })
            } catch (error) {
              // Enhanced error handling for cookie operations
              if (error instanceof Error) {
                // Check if this is a Server Component error (expected)
                if (error.message.includes('Server Component')) {
                  // This is expected when called from Server Components
                  // The middleware will handle session refresh
                  return
                }
                
                console.error('Unexpected error setting cookies:', {
                  message: error.message,
                  stack: error.stack,
                  cookieCount: cookiesToSet.length
                })
              } else {
                console.error('Unknown error setting cookies:', error)
              }
            }
          },
        },
        // Enhanced global configuration
        global: {
          headers: {
            'User-Agent': 'ALX-Polly-Server/2.0.0',
            'X-Client-Info': 'supabase-js-server'
          }
        }
      }
    )
  } catch (error) {
    console.error('Failed to create server Supabase client:', error)
    
    // Provide different error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('environment variable')) {
        throw new Error('Server configuration error: Missing authentication credentials')
      }
      if (error.message.includes('URL')) {
        throw new Error('Server configuration error: Invalid service endpoint')
      }
    }
    
    throw new Error('Authentication service is currently unavailable')
  }
}

/**
 * Creates a Supabase client with service role key for admin operations
 * WARNING: Only use this for trusted server-side operations
 * 
 * @returns Supabase client with elevated permissions
 * @throws Error if service role key is not configured
 */
export async function createServerSupabaseAdminClient(): Promise<SupabaseClient> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Service role key not configured for admin operations')
  }
  
  try {
    validateServerEnvironment()
    
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'User-Agent': 'ALX-Polly-Admin/2.0.0',
            'X-Client-Info': 'supabase-js-admin'
          }
        }
      }
    )
  } catch (error) {
    console.error('Failed to create admin Supabase client:', error)
    throw new Error('Admin service is currently unavailable')
  }
}
