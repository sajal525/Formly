import { LoginPage } from "@/features/auth/components/login-page";
import { getCurrentSession } from "@/lib/auth-dal";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Formly",
  description: "Sign in to your Formly account.",
};

export default async function LoginRoute() {
  const session = await getCurrentSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return <LoginPage />;
}
