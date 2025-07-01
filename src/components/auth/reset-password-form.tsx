
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react'; // Or LockKeyhole
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
    if (!token && !successMessage) { // Only set error if not already in a success state
      // setError("Invalid or missing reset token.");
      // console.warn("Reset token is missing from URL.");
    }
  }, [token, successMessage]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    // setSuccessMessage(null); // Keep success message if already shown

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setIsLoading(false);
      return;
    }
    
    if (!token && !successMessage) { // Prevent submission if token is missing and not already succeeded
      setError("Invalid or missing reset token. Cannot reset password.");
      setIsLoading(false);
      return;
    }

    // Placeholder for actual reset password logic
    // await resetPasswordWithToken(token, password);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccessMessage('Your password has been successfully reset. You can now sign in with your new password.');
    // Example error:
    // setError('Failed to reset password. The link may be invalid or expired.');
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center">
          <KeyRound className="mr-2 h-6 w-6" /> Reset Password
        </CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
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
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || !!successMessage}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !!successMessage}
            />
          </div>
          <Button className="w-full mt-4" type="submit" disabled={isLoading || !!successMessage || (!token && !successMessage) }>
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </CardContent>
      </form>
      {successMessage && (
         <CardFooter className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-muted-foreground text-center">
            <Link href="/signin" className="font-semibold text-primary hover:underline">
              Proceed to Sign In
            </Link>
          </p>
        </CardFooter>
      )}
      {!successMessage && !token && (
         <CardFooter className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-destructive text-center">
            No reset token found in URL. Please use the link from your email.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
