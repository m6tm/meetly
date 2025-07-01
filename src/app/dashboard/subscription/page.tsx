
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, DollarSign, RefreshCw, ShieldAlert, Zap, Package, CalendarDays, LogOut, Loader2, Users, Briefcase, Building, Trash2 } from 'lucide-react';
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

type PlanFeature = {
  text: string;
  available: boolean;
};

type Plan = {
  id: string;
  name: string;
  price: string;
  billingCycle: string;
  icon: React.ElementType;
  features: PlanFeature[];
  actionText: string;
  isCurrent?: boolean;
  actionDisabled?: boolean;
  contactSales?: boolean;
};

type SavedPaymentMethod = {
  id: string;
  cardType: string; // e.g., "Visa", "Mastercard"
  last4: string;
  expiryDate: string; // MM/YY
};

const availablePlans: Plan[] = [
  {
    id: 'free',
    name: 'Basic',
    price: '$0',
    billingCycle: 'per month',
    icon: Users,
    features: [
      { text: 'Up to 1 user', available: true },
      { text: '5 meetings per month', available: true },
      { text: 'Basic transcription', available: true },
      { text: 'Community support', available: true },
    ],
    actionText: 'Switch to Basic',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19.99',
    billingCycle: 'per month',
    icon: Briefcase,
    features: [
      { text: 'Up to 5 users', available: true },
      { text: 'Unlimited meetings', available: true },
      { text: 'Advanced AI transcription & summary', available: true },
      { text: 'Priority email support', available: true },
    ],
    actionText: 'Current Plan',
    isCurrent: true,
    actionDisabled: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    billingCycle: 'billed annually',
    icon: Building,
    features: [
      { text: 'Unlimited users', available: true },
      { text: 'All Pro features', available: true },
      { text: 'Dedicated account manager', available: true },
      { text: 'SSO & advanced security', available: true },
    ],
    actionText: 'Contact Sales',
    contactSales: true,
  },
];

const initialSavedPaymentMethods: SavedPaymentMethod[] = [
  { id: 'pm1', cardType: 'Visa', last4: '1234', expiryDate: '12/25' },
  { id: 'pm2', cardType: 'Mastercard', last4: '5678', expiryDate: '08/26' },
];

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState<string | null>(null); // Plan ID

  // Payment form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  // Saved payment methods state
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>(initialSavedPaymentMethods);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<SavedPaymentMethod | null>(null);
  const [isDeletingPaymentMethod, setIsDeletingPaymentMethod] = useState(false);


  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: "Subscription Cancellation Requested",
      description: "Your subscription cancellation is being processed. We're sorry to see you go!",
      variant: "destructive"
    });
    setIsCancelling(false);
  };

  const handleSavePaymentMethod = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingCard(true);
    // Basic validation (can be enhanced with Zod or similar)
    if (!cardholderName || !cardNumber || !expiryDate || !cvc) {
      toast({ title: "Error", description: "Please fill all card details.", variant: "destructive" });
      setIsSavingCard(false);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate adding to saved list
    const newMethod: SavedPaymentMethod = {
      id: `pm${Date.now()}`,
      cardType: cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Card', // Simple type detection
      last4: cardNumber.slice(-4),
      expiryDate: expiryDate,
    };
    setSavedPaymentMethods(prev => [...prev, newMethod]);

    toast({
      title: "Payment Method Saved",
      description: "Your payment method has been securely saved (simulated).",
    });
    setIsSavingCard(false);
    // Optionally clear form fields
    setCardholderName(''); setCardNumber(''); setExpiryDate(''); setCvc('');
  };
  
  const handleSelectPlan = async (planId: string, planName: string) => {
    if (planId === 'enterprise') {
      toast({ title: "Contacting Sales", description: "We will get in touch with you shortly regarding the Enterprise plan." });
      return;
    }
    setIsChangingPlan(planId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Plan Change Requested",
      description: `Your request to switch to the ${planName} plan is being processed.`,
    });
    setIsChangingPlan(null);
  };

  const handleDeletePaymentMethodClick = (method: SavedPaymentMethod) => {
    setPaymentMethodToDelete(method);
  };

  const confirmDeletePaymentMethod = async () => {
    if (!paymentMethodToDelete) return;
    setIsDeletingPaymentMethod(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSavedPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodToDelete.id));
    toast({
      title: "Payment Method Deleted",
      description: `${paymentMethodToDelete.cardType} ending in ${paymentMethodToDelete.last4} has been removed.`,
    });
    setIsDeletingPaymentMethod(false);
    setPaymentMethodToDelete(null);
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <Package className="mr-3 h-8 w-8 text-primary" /> Manage Your Subscription
        </h1>
        <p className="text-muted-foreground">
          View your current plan, manage payment methods, and make changes to your subscription.
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="shadow-md">
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
              <span className="font-medium text-green-600 flex items-center"><CheckCircle className="mr-1 h-4 w-4" />Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Billing Date:</span>
              <span className="font-medium text-foreground">September 1, 2024</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            <RefreshCw className="mr-2 h-4 w-4" /> Change Billing Cycle (Soon)
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
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
        </CardFooter>
      </Card>

      {/* Available Plans Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5 text-primary" />Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <Card key={plan.id} className={`flex flex-col ${plan.isCurrent ? 'border-primary ring-2 ring-primary' : 'hover:shadow-lg'}`}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <plan.icon className={`h-7 w-7 ${plan.isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-sm text-muted-foreground">{plan.billingCycle}</span>}
                </div>
                {plan.price === "Custom" && <span className="text-sm text-muted-foreground">{plan.billingCycle}</span>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className={`flex items-center ${feature.available ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                      <CheckCircle className={`mr-2 h-4 w-4 ${feature.available ? 'text-green-500' : 'text-muted-foreground'}`} />
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.isCurrent ? "outline" : "default"}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                  disabled={plan.actionDisabled || isChangingPlan === plan.id}
                >
                  {isChangingPlan === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {plan.actionText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Payment Method Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Payment Method</CardTitle>
          <CardDescription>Manage your billing payment details. Add a new card or manage existing ones.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSavePaymentMethod}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John M. Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                  disabled={isSavingCard}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="•••• •••• •••• ••••"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  disabled={isSavingCard}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  disabled={isSavingCard}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="•••"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                  disabled={isSavingCard}
                />
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSavingCard}>
              {isSavingCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              {isSavingCard ? 'Saving Card...' : 'Save New Payment Method'}
            </Button>
          </CardContent>
        </form>
        
        {savedPaymentMethods.length > 0 && (
          <>
            <Separator className="my-6" />
            <CardContent className="space-y-4">
              <h4 className="text-md font-medium text-foreground">Saved Payment Methods</h4>
              <ul className="space-y-3">
                {savedPaymentMethods.map((method) => (
                  <li key={method.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      <CreditCard className="mr-3 h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{method.cardType} ending in •••• {method.last4}</p>
                        <p className="text-xs text-muted-foreground">Expires: {method.expiryDate}</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeletePaymentMethodClick(method)}
                          disabled={isDeletingPaymentMethod && paymentMethodToDelete?.id === method.id}
                        >
                          {isDeletingPaymentMethod && paymentMethodToDelete?.id === method.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      {paymentMethodToDelete && paymentMethodToDelete.id === method.id && (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Delete Payment Method</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {paymentMethodToDelete.cardType} ending in {paymentMethodToDelete.last4}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPaymentMethodToDelete(null)} disabled={isDeletingPaymentMethod}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeletePaymentMethod} disabled={isDeletingPaymentMethod} className="bg-destructive hover:bg-destructive/90">
                              {isDeletingPaymentMethod ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </li>
                ))}
              </ul>
            </CardContent>
          </>
        )}

        <CardFooter className="border-t pt-6 mt-6">
          <Link href="/dashboard/billing-history">
            <Button variant="link" className="p-0 h-auto text-base">
              <CalendarDays className="mr-2 h-4 w-4" /> View Billing History
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* This ensures the AlertDialog for delete confirmation is only rendered when needed */}
      {/* A single AlertDialog can be managed if preferred, but separate triggers like above are also fine */}
      {!paymentMethodToDelete && <AlertDialog open={false} onOpenChange={() => { }}><AlertDialogContent /></AlertDialog>}
    </div>
  );
}
