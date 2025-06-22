
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home } from 'lucide-react';
import AppHeader from '@/components/layout/app-header';
import AppFooter from '@/components/layout/app-footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <AlertTriangle className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold mt-4">404 - Page Not Found</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please check the URL for any mistakes or go back to the dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
