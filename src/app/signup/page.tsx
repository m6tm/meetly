
import AppFooter from "@/components/layout/app-footer";
import AppHeader from "@/components/layout/app-header";
import SignUpForm from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <SignUpForm />
      </main>
      <AppFooter />
    </div>
  );
}
