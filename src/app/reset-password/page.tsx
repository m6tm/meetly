
import AppFooter from "@/components/layout/app-footer";
import AppHeader from "@/components/layout/app-header";
import ResetPasswordForm from "@/components/auth/reset-password-form";

// This is a Server Component.
// It will receive searchParams as a prop if the URL has them.
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // We are not using searchParams directly in this Server Component to avoid potential enumeration issues.
  // The client component ResetPasswordForm will use the useSearchParams hook.
  // If needed, specific searchParams could be read here and passed down, e.g. searchParams?.token
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <ResetPasswordForm />
      </main>
      <AppFooter />
    </div>
  );
}
