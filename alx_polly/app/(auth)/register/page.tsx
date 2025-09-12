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

function RegisterPageContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    // Client-side validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        // Map Supabase errors to user-friendly messages
        switch (error.message) {
          case 'User already registered':
            setErrorMsg('An account with this email already exists. Please sign in instead.');
            break;
          case 'Password should be at least 6 characters':
            setErrorMsg('Password must be at least 6 characters long');
            break;
          case 'Signup requires a valid password':
            setErrorMsg('Please enter a valid password');
            break;
          default:
            setErrorMsg(error.message || 'An error occurred during registration. Please try again.');
        }
      } else {
        router.push('/polls');
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
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start creating and voting in polls.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleRegister}>
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
              <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="Your name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
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
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <InlineSpinner className="mr-2" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link className="underline" href="/login">Log in</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <RegisterPageContent />
    </ErrorBoundary>
  );
}





