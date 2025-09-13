'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useState, useCallback, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoginSchema, validateRateLimit } from '@/lib/validation-utils'

type LoginFormData = {
  email: string;
  password: string;
};

/**
 * Enhanced Login Page Component
 * 
 * WHAT: Secure login form with improved UX and accessibility
 * WHY: Provides better user experience and follows security best practices
 * HOW: Implements proper validation, error handling, and accessibility features
 */
function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const router = useRouter()
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  
  // Generate unique IDs for accessibility
  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()

  // Rate limiting check
  const checkRateLimit = (email: string): boolean => {
    const rateLimit = validateRateLimit(`login_${email}`, 5, 300000); // 5 attempts per 5 minutes
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString();
      setRateLimitError(`Too many login attempts. Please try again after ${resetTime}.`);
      return false;
    }
    setRateLimitError(null);
    return true;
  };

  const handleLogin = useCallback(async (data: LoginFormData) => {
    setIsLoading(true)
    setErrorMsg('')

    try {
      // Check rate limiting
      if (!checkRateLimit(data.email)) {
        setIsLoading(false)
        return
      }


      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Please check your email and click the confirmation link before logging in.')
        } else if (error.message.includes('Too many requests')) {
          setErrorMsg('Too many login attempts. Please wait a moment before trying again.')
        } else {
          setErrorMsg('Login failed. Please try again or contact support if the problem persists.')
        }
      } else if (authData.user) {
        // Clear any rate limiting data on successful login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`rate_limit_login_${data.email}`);
        }
        // Get redirect URL from query params or default to dashboard
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirectTo') || '/dashboard'
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [checkRateLimit, router])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  // Clear errors when user starts typing
  const clearErrors = () => {
    if (errorMsg) setErrorMsg('')
    if (rateLimitError) setRateLimitError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4" noValidate>
            {(errorMsg || rateLimitError) && (
              <Alert variant="destructive" role="alert" aria-describedby={errorId}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription id={errorId}>
                  {errorMsg || rateLimitError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                placeholder="Enter your email"
                {...form.register('email')}
                onChange={(e) => {
                  form.setValue('email', e.target.value)
                  clearErrors()
                }}
                required
                disabled={isLoading}
                className="w-full"
                aria-invalid={errorMsg ? 'true' : 'false'}
                aria-describedby={errorMsg ? errorId : undefined}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={passwordId}>Password</Label>
              <div className="relative">
                <Input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...form.register('password')}
                  onChange={(e) => {
                    form.setValue('password', e.target.value)
                    clearErrors()
                  }}
                  required
                  disabled={isLoading}
                  className="w-full pr-10"
                  aria-invalid={errorMsg ? 'true' : 'false'}
                  aria-describedby={errorMsg ? errorId : undefined}
                  autoComplete="current-password"
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !!rateLimitError}
              aria-describedby={errorMsg ? errorId : undefined}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-blue-600 hover:text-blue-500 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginPageContent />
    </ErrorBoundary>
  );
}





