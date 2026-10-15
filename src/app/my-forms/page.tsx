import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-dal";
import { AppShell } from "@/components/app-shell/app-shell";
import { parseMyFormsQueryParams } from "@/features/forms/schemas/my-forms-query-schema";
import { getMyFormsPage } from "@/features/forms/server/get-my-forms-page";
import { MyFormsClient } from "@/features/forms/components/my-forms-client";

export const metadata = {
  title: "My Forms | Formly",
  description: "Create, manage and track all your forms with Formly.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MyFormsPage({ searchParams }: PageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const rawSearchParams = await searchParams;
  const validatedParams = parseMyFormsQueryParams(rawSearchParams);
  const formsData = await getMyFormsPage(user.id, validatedParams);

  return (
    <AppShell user={user}>
      <MyFormsClient initialData={formsData} queryParams={validatedParams} />
    </AppShell>
  );
}
