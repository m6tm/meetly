
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2 } from 'lucide-react';

const OTP_LENGTH = 6;

export default function TwoFactorForm() {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    // Focus the first input on mount if it's available
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    // Allow only one digit per input
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);

    // If value is entered and it's not the last input, focus next
    if (value && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[index] !== '') {
        // If current input has a value, clear it
        newOtp[index] = '';
        setOtp(newOtp);
        // Focus remains on the current input
      } else if (index > 0 && inputRefs.current[index - 1]) {
        // If current input is empty and it's not the first input, move to previous
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pastedData)) return; // Only paste if it's all digits

    const newOtp = new Array(OTP_LENGTH).fill('');
    let filledCount = 0;
    for (let i = 0; i < pastedData.length && i < OTP_LENGTH; i++) {
      newOtp[i] = pastedData[i];
      filledCount++;
    }
    setOtp(newOtp);

    if (filledCount < OTP_LENGTH && inputRefs.current[filledCount]) {
      inputRefs.current[filledCount]?.focus();
    } else if (inputRefs.current[OTP_LENGTH - 1]) {
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const finalCode = otp.join('');
    console.log('2FA Code submitted:', finalCode);

    // Placeholder for actual 2FA verification logic
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (finalCode === "123456") { // Example: Successful code
      console.log("2FA successful, redirecting...");
      // router.push('/'); 
    } else {
      setError('Invalid authentication code. Please try again.');
      setOtp(new Array(OTP_LENGTH).fill('')); // Clear inputs on error
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }
    setIsLoading(false);
  };

  const isSubmitDisabled = isLoading || otp.join('').length !== OTP_LENGTH;

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center items-center mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the {OTP_LENGTH}-digit code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-sm text-center">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="otp-input-0" className="sr-only">Authentication Code</Label>
            <div 
              className="flex justify-center space-x-2 sm:space-x-3"
              onPaste={handlePaste} // Attach paste handler to the container
            >
              {otp.map((value, index) => (
                <Input
                  key={index}
                  id={`otp-input-${index}`}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text" // Use text to allow easier control, pattern for numeric
                  inputMode="numeric"
                  pattern="\d{1}"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl border-input border-2 focus:border-primary focus:ring-1 focus:ring-primary rounded-md shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={isLoading}
                  aria-label={`Digit ${index + 1} of OTP`}
                />
              ))}
            </div>
          </div>
          <Button className="w-full mt-2" type="submit" disabled={isSubmitDisabled}>
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
