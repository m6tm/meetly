
import AppFooter from "@/components/layout/app-footer";
import AppHeader from "@/components/layout/app-header";
import AccountRecoveryForm from "@/components/auth/account-recovery-form";

export default function AccountRecoveryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <AccountRecoveryForm />
      </main>
      <AppFooter />
    </div>
  );
}
