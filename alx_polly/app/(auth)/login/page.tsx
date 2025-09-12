'use client'

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    // Basic client-side validation
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Map Supabase errors to user-friendly messages
        switch (error.message) {
          case 'Invalid login credentials':
            setErrorMsg('Invalid email or password. Please try again.');
            break;
          case 'Email not confirmed':
            setErrorMsg('Please check your email and confirm your account before signing in.');
            break;
          case 'Too many requests':
            setErrorMsg('Too many login attempts. Please wait a moment and try again.');
            break;
          default:
            setErrorMsg('An error occurred during sign in. Please try again.');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="text-black">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Access your account to create and vote in polls.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleLogin}>
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
              <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <InlineSpinner className="mr-2" />
                Signing in...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Don’t have an account? <Link className="underline" href="/register">Sign up</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginPageContent />
    </ErrorBoundary>
  );
}





