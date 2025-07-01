
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailQuestion } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    // Placeholder for actual forgot password logic
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Example success:
    setSuccessMessage('If an account exists for this email, a password reset link has been sent.');
    // Example error:
    // setError('Failed to send reset link. Please try again.');
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center">
          <MailQuestion className="mr-2 h-6 w-6" /> Forgot Password
        </CardTitle>
        <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-md bg-primary/10 text-primary border border-primary/30 text-sm">
              {successMessage}
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
              disabled={isLoading || !!successMessage}
            />
          </div>
          <Button className="w-full mt-4" type="submit" disabled={isLoading || !!successMessage}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-muted-foreground text-center">
          Remembered your password?{' '}
          <Link href="/signin" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
