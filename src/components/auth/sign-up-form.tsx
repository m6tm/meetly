
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setIsLoading(false);
      return;
    }

    console.log('Sign Up submitted with:', { email, password });
    // Placeholder for actual sign-up logic
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // setError('This email is already taken.'); // Example error
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center">
          <UserPlus className="mr-2 h-6 w-6" /> Create Account
        </CardTitle>
        <CardDescription>Enter your email and password to create an account.</CardDescription>
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
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
           <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/signin" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
