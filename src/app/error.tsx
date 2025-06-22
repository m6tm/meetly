
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ServerCrash, Home } from 'lucide-react'
import AppHeader from '@/components/layout/app-header'
import AppFooter from '@/components/layout/app-footer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
              <ServerCrash className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold mt-4">Something went wrong</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              We encountered an unexpected error. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If the problem persists, please contact support.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
             <Button onClick={() => reset()}>
              Try again
            </Button>
            <Button asChild variant="outline">
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
  )
}
