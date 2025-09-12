'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Session, User } from '@supabase/supabase-js'
import type { AuthContextType } from '@/lib/auth-types'

/**
 * Authentication Context for ALX Polly Application
 * 
 * WHAT: This context provides centralized authentication state management using Supabase Auth.
 * It maintains user session state, handles authentication events, and provides authentication
 * data throughout the React component tree using React Context API.
 * 
 * WHY: Centralized authentication is essential because:
 * 1. Multiple components need access to user state (dashboard, voting forms, navigation)
 * 2. Authentication state changes (login/logout) must be reflected across the entire app
 * 3. We need to prevent prop drilling of user data through component hierarchies
 * 4. Session persistence across page refreshes requires coordinated state management
 * 5. Real-time auth events (token refresh, logout in other tabs) need global handling
 * 
 * HOW: Uses React Context + Supabase Auth listeners to maintain synchronized state:
 * - Context Provider wraps the entire app to provide global state access
 * - Supabase auth listeners automatically update state on auth changes
 * - Loading states prevent rendering issues during auth resolution
 * - Session persistence is handled automatically by Supabase
 * 
 * @example
 * ```tsx
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * // Use in components
 * const { user, session, loading } = useAuth()
 * if (loading) return <LoadingSpinner />
 * if (!user) return <LoginPrompt />
 * ```
 */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    /**
     * Retrieves the current authentication session from Supabase
     * 
     * WHY: Initial session retrieval is necessary because:
     * - Page refreshes lose client-side state but session persists in cookies
     * - We need to restore authentication state from persisted session
     * - Loading state prevents flash of unauthenticated content
     */
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    /**
     * Subscribe to authentication state changes
     * 
     * WHY: Real-time listeners are essential because:
     * - Users can log in/out from multiple tabs (state must sync across tabs)
     * - Session tokens expire and refresh automatically (must update state)
     * - External auth events (password changes) require immediate state updates
     * - Manual auth calls from components need to reflect in global state
     * 
     * HOW: Supabase provides onAuthStateChange listener that fires on all auth events
     */
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Cleanup subscription on component unmount
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
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
