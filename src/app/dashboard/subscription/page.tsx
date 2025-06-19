
'use client';

import React from 'react';
import Link from 'next/link'; // Added import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CreditCard, DollarSign, RefreshCw, ShieldAlert, Zap, Package, CalendarDays, LogOut, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: "Subscription Cancellation Requested",
      description: "Your subscription cancellation is being processed. We're sorry to see you go!",
      variant: "destructive"
    });
    // In a real app, you'd update UI state or redirect
    setIsCancelling(false);
    // Potentially close the dialog if it's part of one, or update UI to reflect cancellation pending/confirmed.
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Package className="mr-3 h-8 w-8 text-primary" /> Manage Your Subscription
        </h1>
        <p className="text-muted-foreground">
          View your current plan, manage payment methods, and make changes to your subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><Zap className="mr-2 h-5 w-5 text-primary" />Current Plan</CardTitle>
            <CardDescription>Details of your active subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">Billed monthly</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">$19.99</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600 flex items-center"><CheckCircle className="mr-1 h-4 w-4"/>Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Billing Date:</span>
                <span className="font-medium text-foreground">September 1, 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Users:</span>
                <span className="font-medium text-foreground">Up to 5 users</span>
              </div>
               <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meetings per month:</span>
                <span className="font-medium text-foreground">Unlimited</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transcription:</span>
                <span className="font-medium text-foreground">Included</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
             <Button variant="outline" className="w-full sm:w-auto" disabled>
                <RefreshCw className="mr-2 h-4 w-4" /> Change Billing Cycle (Soon)
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Options Card */}
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5 text-primary" />Plan Options</CardTitle>
            <CardDescription>Explore other plans or modify yours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" disabled>
                <Zap className="mr-2 h-4 w-4" /> Upgrade to Enterprise (Soon)
            </Button>
             <Button variant="outline" className="w-full" disabled>
                Compare Plans (Soon)
            </Button>
            <Separator className="my-4" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <ShieldAlert className="mr-2 h-4 w-4" /> Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will cancel your Pro Plan subscription at the end of the current billing period (September 1, 2024). 
                    You will retain access to Pro features until then. This action cannot be undone through this interface.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isCancelling}>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription} disabled={isCancelling} className="bg-destructive hover:bg-destructive/90">
                    {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isCancelling ? "Cancelling..." : "Yes, Cancel Subscription"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Payment Method</CardTitle>
          <CardDescription>Manage your billing payment details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center">
              <CreditCard className="mr-3 h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Visa **** **** **** 1234</p>
                <p className="text-xs text-muted-foreground">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>Update (Soon)</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            To update your payment method, please contact support or use the (coming soon) self-service portal.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Link href="/dashboard/billing-history">
            <Button variant="link">
                <CalendarDays className="mr-2 h-4 w-4" /> View Billing History
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
