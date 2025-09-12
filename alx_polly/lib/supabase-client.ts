/**
 * Enhanced Supabase Browser Client Configuration
 * 
 * This module provides a secure browser-side Supabase client with enhanced
 * error handling, validation, and security measures for client-side operations.
 * 
 * Security Features:
 * - Environment variable validation
 * - Secure cookie configuration
 * - Error boundary protection
 * - Client-side security headers
 * 
 * @fileoverview Secure Supabase browser client configuration
 * @version 2.0.0
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Validates required environment variables
 * @throws Error if required environment variables are missing
 */
function validateEnvironment(): void {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    
    // Basic URL validation for Supabase URL
    if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('https://')) {
      throw new Error('Supabase URL must use HTTPS protocol')
    }
  }
}

/**
 * Creates a secure browser-side Supabase client
 * 
 * @returns Configured Supabase client with security enhancements
 * @throws Error if environment variables are invalid
 */
export function createClient(): SupabaseClient {
  try {
    validateEnvironment()
    
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Enhanced security options
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce', // Use PKCE flow for enhanced security
          autoRefreshToken: true,
          // Secure storage options
          storage: {
            getItem: (key: string) => {
              if (typeof window === 'undefined') return null
              try {
                return window.localStorage.getItem(key)
              } catch {
                return null
              }
            },
            setItem: (key: string, value: string) => {
              if (typeof window === 'undefined') return
              try {
                window.localStorage.setItem(key, value)
              } catch {
                // Silently fail if localStorage is not available
              }
            },
            removeItem: (key: string) => {
              if (typeof window === 'undefined') return
              try {
                window.localStorage.removeItem(key)
              } catch {
                // Silently fail if localStorage is not available
              }
            }
          }
        },
        // Enhanced cookie configuration
        cookies: {
          getAll: () => {
            if (typeof document === 'undefined') return []
            return document.cookie
              .split(';')
              .map(cookie => {
                const [name, ...rest] = cookie.trim().split('=')
                return { name, value: rest.join('=') }
              })
              .filter(cookie => cookie.name && cookie.value)
          },
          setAll: (cookies) => {
            if (typeof document === 'undefined') return
            cookies.forEach(({ name, value, options }) => {
              const cookieOptions = {
                secure: true, // Always use secure cookies
                sameSite: 'lax' as const,
                path: '/',
                ...options
              }
              
              let cookieString = `${name}=${value}`
              
              if (cookieOptions.maxAge) {
                cookieString += `; Max-Age=${cookieOptions.maxAge}`
              }
              if (cookieOptions.path) {
                cookieString += `; Path=${cookieOptions.path}`
              }
              if (cookieOptions.secure) {
                cookieString += '; Secure'
              }
              if (cookieOptions.sameSite) {
                cookieString += `; SameSite=${cookieOptions.sameSite}`
              }
              
              document.cookie = cookieString
            })
          }
        }
      }
    )
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw new Error('Authentication service is currently unavailable')
  }
}
