
import AppFooter from "@/components/layout/app-footer";
import AppHeader from "@/components/layout/app-header";
import SignInForm from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <SignInForm />
      </main>
      <AppFooter />
    </div>
  );
}
