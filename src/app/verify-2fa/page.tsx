
import AppFooter from "@/components/layout/app-footer";
import AppHeader from "@/components/layout/app-header";
import TwoFactorForm from "@/components/auth/two-factor-form";

export default function Verify2FAPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <TwoFactorForm />
      </main>
      <AppFooter />
    </div>
  );
}
