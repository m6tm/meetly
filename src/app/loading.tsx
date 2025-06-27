import AppLoadingSkeleton from "@/components/layout/app-loading-skeleton";

export default function Loading() {
  // This component will be automatically rendered by Next.js
  // for non-dashboard pages. Dashboard pages have their own loading.tsx.
  return <AppLoadingSkeleton />;
}
