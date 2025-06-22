
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <ResetPasswordForm />
    </div>
  );
}
