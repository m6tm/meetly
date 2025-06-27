import { Skeleton } from "@/components/ui/skeleton";
import AppHeader from "@/components/layout/app-header";
import AppFooter from "@/components/layout/app-footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function FeatureCardSkeleton() {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-56" />
            </CardContent>
        </Card>
    );
}

function AICardSkeleton() {
     return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="min-h-[120px] w-full" />
                <Skeleton className="h-10 w-44" />
            </CardContent>
        </Card>
    );
}

export default function AppLoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <section className="text-center py-12">
            <Skeleton className="h-12 w-1/3 mx-auto mb-4" />
            <Skeleton className="h-7 w-2/3 mx-auto" />
          </section>

          <section>
            <Skeleton className="h-8 w-1/4 mx-auto mb-8" />
            <div className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCardSkeleton />
              <FeatureCardSkeleton />
              <FeatureCardSkeleton />
            </div>
          </section>
          
          <Skeleton className="h-px w-full" />

          <section>
            <Skeleton className="h-8 w-1/4 mx-auto mb-8" />
            <div className="grid gap-6 md:gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
                <AICardSkeleton />
                <AICardSkeleton />
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
