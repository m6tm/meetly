
import AppFooter from "@/components/layout/app-footer";
import AppHeader from "@/components/layout/app-header";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
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
