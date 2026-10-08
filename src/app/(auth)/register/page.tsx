import { RegistrationPage } from "@/features/auth/components/registration-page";
import { getCurrentSession } from "@/lib/auth-dal";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Formly",
  description: "Create your Formly account with just a username and password.",
};

export default async function RegisterRoute() {
  const session = await getCurrentSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return <RegistrationPage />;
}
