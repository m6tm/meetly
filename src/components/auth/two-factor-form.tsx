
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function TwoFactorForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log('2FA Code submitted:', code);
    // Placeholder for actual 2FA verification logic
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (code === "123456") { // Example: Successful code
      // Redirect to dashboard or home page
      console.log("2FA successful, redirecting...");
      // router.push('/'); 
    } else {
      setError('Invalid authentication code. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center">
          <ShieldCheck className="mr-2 h-6 w-6" /> Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="2fa-code">Authentication Code</Label>
            <Input 
              id="2fa-code" 
              type="text" 
              inputMode="numeric"
              pattern="\d{6}"
              placeholder="123456" 
              required 
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              disabled={isLoading}
              maxLength={6}
            />
          </div>
          <Button className="w-full mt-4" type="submit" disabled={isLoading || code.length !== 6}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-muted-foreground text-center">
          Lost your device?{' '}
          <Link href="/recover-account" className="font-semibold text-primary hover:underline">
            Account Recovery
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
