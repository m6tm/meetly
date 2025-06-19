
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log('Sign In submitted with:', { email, password });
    // Placeholder for actual sign-in logic
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // setError('Invalid email or password.'); // Example error
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center">
          <LogIn className="mr-2 h-6 w-6" /> Sign In
        </CardTitle>
        <CardDescription>Enter your email below to login to your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
