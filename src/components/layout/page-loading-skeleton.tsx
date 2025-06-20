
import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoadingSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar Skeleton - visible on md and up */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card p-4 space-y-4 shrink-0">
        {/* Sidebar Header Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        {/* Sidebar Menu Skeleton Items */}
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />

        <div className="mt-auto space-y-2">
           <Skeleton className="h-px w-full" /> {/* Separator */}
           <Skeleton className="h-9 w-full rounded-md" /> {/* Settings item */}
        </div>
        
        {/* Sidebar Footer Skeleton */}
        <div className="pt-4 mt-auto border-t">
            <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="h-16 border-b bg-background p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
             <Skeleton className="h-7 w-7 md:hidden" /> {/* Mobile Sidebar Trigger */}
             <Skeleton className="h-6 w-40 hidden md:block" /> {/* Page Title Area */}
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Theme Toggle */}
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Notifications */}
            {/* User/Profile area was in sidebar footer, not here */}
          </div>
        </div>

        {/* Page Content Skeleton */}
        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
                <Skeleton className="h-8 w-48 md:w-72" /> {/* Main Page Title */}
                <Skeleton className="h-4 w-64 md:w-96" /> {/* Page Description */}
            </div>
            <Skeleton className="h-10 w-32 hidden sm:block" /> {/* Action Button */}
          </div>
          
          {/* Example Card Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full mt-2" />
            </div>
             <div className="rounded-lg border bg-card p-6 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full mt-2" />
            </div>
             <div className="rounded-lg border bg-card p-6 space-y-3 hidden lg:block">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full mt-2" />
            </div>
          </div>
          
          {/* Example Table/Large Content Area */}
          <div className="rounded-lg border bg-card p-4 md:p-6 space-y-4">
            <Skeleton className="h-6 w-1/3 mb-4" /> {/* Table Title */}
            <Skeleton className="h-10 w-full" /> {/* Filter/Controls row */}
            <Skeleton className="h-12 w-full" /> {/* Table Header */}
            <Skeleton className="h-10 w-full" /> {/* Table Row */}
            <Skeleton className="h-10 w-full" /> {/* Table Row */}
            <Skeleton className="h-10 w-full" /> {/* Table Row */}
            <Skeleton className="h-10 w-full" /> {/* Table Row */}
          </div>
        </div>
      </div>
    </div>
  );
}
