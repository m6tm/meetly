"use client";

import AppHeader from "@/components/layout/app-header";
import AppFooter from "@/components/layout/app-footer";
import QuickMeetCard from "@/components/meetly/quick-meet-card";
import ScheduleMeetingCard from "@/components/meetly/schedule-meeting-card";
import RecordingsCard from "@/components/meetly/recordings-card";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { userStore } from "@/stores/user.store";


export default function HomePage() {
  const { user, setUser } = userStore()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <section className="text-center py-12 md:py-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 tracking-tight">
              Meetly
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Your AI-Powered Meeting Hub. Streamline communication, automate insights, and boost productivity.
            </p>
          </section>

          {user && (
            <>
              <section className="mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6 md:mb-8 text-center">Core Features</h2>
                <div className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <QuickMeetCard />
                  <ScheduleMeetingCard />
                  <RecordingsCard />
                </div>
              </section>
              <Separator className="my-12 md:my-16" />
            </>
          )}

        </div>
      </main>
      <AppFooter />
    </div>
  );
}

function CoreFeatureSkeleton() {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          <Skeleton className="h-6 w-32 rounded bg-muted" />
        </div>
        <Skeleton className="h-4 w-48 rounded bg-muted mb-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full rounded bg-muted" />
        <Skeleton className="h-4 w-56 rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
