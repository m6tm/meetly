import PageLoadingSkeleton from "@/components/layout/page-loading-skeleton";

export default function Loading() {
  // This component will be automatically rendered by Next.js
  // when navigating to a new route segment while data is being fetched
  // or server components are rendering.
  return <PageLoadingSkeleton />;
}
