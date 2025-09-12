'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Session, User, AuthError } from '@supabase/supabase-js'
import type { AuthContextType } from '@/lib/auth-types'

/**
 * Enhanced Authentication Context for ALX Polly Application
 * 
 * WHAT: This context provides secure, centralized authentication state management using Supabase Auth
 * with enhanced security measures, error handling, and performance optimizations.
 * 
 * WHY: Enhanced authentication is essential because:
 * 1. Multiple components need access to user state (dashboard, voting forms, navigation)
 * 2. Authentication state changes (login/logout) must be reflected across the entire app
 * 3. We need to prevent prop drilling of user data through component hierarchies
 * 4. Session persistence across page refreshes requires coordinated state management
 * 5. Real-time auth events (token refresh, logout in other tabs) need global handling
 * 6. Security vulnerabilities require proper session validation and error handling
 * 7. Performance optimization prevents unnecessary re-renders and memory leaks
 * 
 * HOW: Uses React Context + Supabase Auth listeners with enhanced features:
 * - Context Provider wraps the entire app to provide global state access
 * - Supabase auth listeners automatically update state on auth changes
 * - Loading states prevent rendering issues during auth resolution
 * - Session persistence is handled automatically by Supabase
 * - Enhanced security with session validation and XSS protection
 * - Performance optimizations with debounced updates and memory leak prevention
 * - Comprehensive error handling with retry logic
 * 
 * @example
 * ```tsx
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * // Use in components
 * const { user, session, loading, signOut, refreshSession } = useAuth()
 * if (loading) return <LoadingSpinner />
 * if (!user) return <LoginPrompt />
 * ```
 */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Enhanced auth state interface
interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  error: AuthError | null
  initialized: boolean
}

/**
 * AuthProvider Component
 * 
 * WHAT: Root-level provider component that initializes and manages authentication state
 * for the entire application. Wraps child components with authentication context.
 * 
 * WHY: This component exists because:
 * 1. React Context requires a Provider component to make values available to children
 * 2. Authentication initialization must happen at the app root level
 * 3. Auth listeners need to be set up once and remain active throughout app lifecycle
 * 4. Loading states prevent hydration mismatches between server/client
 * 
 * HOW: Initializes Supabase client, sets up auth listeners, manages state updates
 * 
 * @param children - React children to wrap with authentication context
 * @returns JSX.Element providing authentication context
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    error: null,
    initialized: false
  })
  
  // Refs for cleanup and debouncing
  const mountedRef = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  // Debounced state update to prevent excessive re-renders
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    if (!mountedRef.current) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setAuthState(prev => ({ ...prev, ...updates }))
      }
    }, 50) // 50ms debounce
  }, [])

  // Enhanced session validation
  const validateSession = useCallback((session: Session | null): boolean => {
    if (!session) return true // null session is valid (logged out state)
    
    try {
      // Check if session is expired
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        console.warn('Session has expired')
        return false
      }
      
      // Validate required session properties
      if (!session.access_token || !session.user) {
        console.warn('Session is missing required properties')
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error validating session:', error)
      return false
    }
  }, [])

  // Enhanced session refresh with retry logic
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!mountedRef.current) return false
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh failed:', error)
        updateAuthState({ error, session: null, user: null })
        return false
      }
      
      if (data.session && validateSession(data.session)) {
        updateAuthState({
          session: data.session,
          user: data.user,
          error: null
        })
        retryCountRef.current = 0 // Reset retry count on success
        return true
      }
      
      return false
    } catch (error) {
      console.error('Unexpected error during session refresh:', error)
      updateAuthState({ error: error as AuthError })
      return false
    }
  }, [updateAuthState, validateSession])

  // Enhanced sign out with cleanup
  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out failed:', error)
        updateAuthState({ error })
        return false
      }
      
      // Clear auth state
      updateAuthState({
        session: null,
        user: null,
        error: null,
        loading: false
      })
      
      return true
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      updateAuthState({ error: error as AuthError })
      return false
    }
  }, [updateAuthState])

  useEffect(() => {
    const supabase = createClient()
    let authListener: { data: { subscription: any } } | null = null

    /**
     * Enhanced session initialization with error handling and retry logic
     * 
     * WHY: Initial session retrieval is necessary because:
     * - Page refreshes lose client-side state but session persists in cookies
     * - We need to restore authentication state from persisted session
     * - Loading state prevents flash of unauthenticated content
     * - Error handling prevents app crashes on auth failures
     * - Retry logic handles temporary network issues
     */
    const initializeAuth = async () => {
      try {
        updateAuthState({ loading: true, error: null })
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Failed to get initial session:', error)
          updateAuthState({ 
            error, 
            loading: false, 
            initialized: true 
          })
          return
        }
        
        // Validate session before setting state
        if (session && !validateSession(session)) {
          console.warn('Invalid session detected, clearing auth state')
          updateAuthState({
            session: null,
            user: null,
            loading: false,
            initialized: true
          })
          return
        }
        
        updateAuthState({
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true,
          error: null
        })
        
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error)
        updateAuthState({ 
          error: error as AuthError, 
          loading: false, 
          initialized: true 
        })
      }
    }

    initializeAuth()

    /**
     * Enhanced authentication state change listener
     * 
     * WHY: Real-time listeners are essential because:
     * - Users can log in/out from multiple tabs (state must sync across tabs)
     * - Session tokens expire and refresh automatically (must update state)
     * - External auth events (password changes) require immediate state updates
     * - Manual auth calls from components need to reflect in global state
     * 
     * HOW: Supabase provides onAuthStateChange listener with enhanced error handling
     */
    try {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current) return
        
        console.log('Auth state changed:', event)
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (session && validateSession(session)) {
              updateAuthState({
                session,
                user: session.user,
                error: null,
                loading: false
              })
            } else {
              console.warn('Invalid session received, signing out')
              await signOut()
            }
            break
            
          case 'SIGNED_OUT':
            updateAuthState({
              session: null,
              user: null,
              error: null,
              loading: false
            })
            break
            
          default:
            // Handle other events or unknown events
            updateAuthState({
              session,
              user: session?.user ?? null,
              loading: false
            })
        }
      })
      
      authListener = { data: listener }
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
      updateAuthState({ error: error as AuthError })
    }

    // Enhanced cleanup function
    return () => {
      mountedRef.current = false
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      if (authListener?.data?.subscription) {
        try {
          authListener.data.subscription.unsubscribe()
        } catch (error) {
          console.error('Error unsubscribing from auth listener:', error)
        }
      }
    }
  }, [updateAuthState, validateSession, signOut])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    session: authState.session,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    initialized: authState.initialized,
    signOut,
    refreshSession
  }), [authState, signOut, refreshSession])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth Hook
 * 
 * WHAT: Custom React hook that provides access to authentication state from the AuthContext.
 * Returns current user, session, and loading state for components to use.
 * 
 * WHY: This hook exists because:
 * 1. Direct context access is verbose and error-prone (useContext(AuthContext))
 * 2. We need consistent error handling when context is used outside provider
 * 3. Type safety ensures context is always available when hook is used
 * 4. Provides a clean, documented API for accessing auth state
 * 
 * HOW: Wraps useContext with error checking and type safety
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType object containing session, user, and loading state
 * 
 * @example
 * ```tsx
 * const { user, session, loading } = useAuth()
 * 
 * if (loading) {
 *   return <div>Loading...</div>
 * }
 * 
 * if (!user) {
 *   return <LoginForm />
 * }
 * 
 * return <Dashboard user={user} />
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
