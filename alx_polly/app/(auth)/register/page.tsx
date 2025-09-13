'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useState, useCallback, useId, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Eye, EyeOff, AlertCircle, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RegistrationSchema, validatePasswordStrength, validateRateLimit } from '@/lib/validation-utils'

/**
 * Enhanced Registration Page Component
 * 
 * WHAT: Secure registration form with comprehensive validation and UX
 * WHY: Provides smooth onboarding experience with proper security measures
 * HOW: Implements client-side validation, proper error handling, and accessibility
 */
type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

function RegisterPageContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[]; isValid: boolean } | null>(null)
  const router = useRouter()
  
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })
  
  // Generate unique IDs for accessibility
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()

  // Watch password field for strength validation
  const password = form.watch('password')
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [password])

  // Rate limiting check
  const checkRateLimit = (email: string): boolean => {
    const rateLimit = validateRateLimit(`register_${email}`, 3, 600000) // 3 attempts per 10 minutes
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString()
      setRateLimitError(`Too many registration attempts. Please try again after ${resetTime}.`)
      return false
    }
    setRateLimitError(null)
    return true
  }

  const handleRegister = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true)
    setErrorMsg('')

    try {
      // Check rate limiting
      if (!checkRateLimit(data.email)) {
        setIsLoading(false)
        return
      }

      // Check password strength
      if (!passwordStrength?.isValid) {
        throw new Error('Please choose a stronger password that meets all requirements.')
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.')
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password does not meet security requirements. Please choose a stronger password.')
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.')
        } else {
          throw error
        }
      }

      if (authData.user) {
        // Clear any rate limiting data on successful registration
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`rate_limit_register_${data.email}`)
        }
        setErrorMsg('Success! Please check your email and click the confirmation link to complete registration.')
        form.reset()
        setPasswordStrength(null)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setErrorMsg(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [passwordStrength, supabase.auth, form, checkRateLimit])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Start creating and voting in polls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4" noValidate>
            {(errorMsg || rateLimitError) && (
              <Alert 
                variant={(errorMsg && errorMsg.startsWith('Success!')) ? 'default' : 'destructive'} 
                role="alert" 
                aria-describedby={errorId}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription id={errorId}>
                  {errorMsg || rateLimitError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor={nameId}>Full Name</Label>
              <div className="relative">
                <Input
                  id={nameId}
                  type="text"
                  placeholder="Enter your full name"
                  {...form.register('name')}
                  required
                  disabled={isLoading}
                  className="w-full pl-10"
                  aria-invalid={errorMsg ? 'true' : 'false'}
                  aria-describedby={errorMsg ? errorId : undefined}
                  autoComplete="name"
                  maxLength={50}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                placeholder="Enter your email"
                {...form.register('email')}
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
                  placeholder="Create a strong password"
                  {...form.register('password')}
                  required
                  disabled={isLoading}
                  className="w-full pr-10"
                  aria-invalid={errorMsg ? 'true' : 'false'}
                  aria-describedby={errorMsg ? errorId : undefined}
                  autoComplete="new-password"
                  minLength={8}
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
              {passwordStrength && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.score < 2 ? 'bg-red-500' :
                          passwordStrength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score < 2 ? 'text-red-600' :
                      passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.score < 2 ? 'Weak' :
                       passwordStrength.score < 4 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !!rateLimitError || !passwordStrength?.isValid}
              aria-describedby={errorMsg ? errorId : undefined}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-500 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <RegisterPageContent />
    </ErrorBoundary>
  );
}





