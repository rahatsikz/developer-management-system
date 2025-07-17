import type { Metadata } from "next";
import AuthForm from "./_components/auth-form";

export const metadata: Metadata = {
  title: "DMS OTP Sign In",
  description: "Sign in with a one-time password sent to your email",
};

export default function Home() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4'>
      <div className='w-full max-w-md'>
        <AuthForm />
      </div>
    </div>
  );
}
