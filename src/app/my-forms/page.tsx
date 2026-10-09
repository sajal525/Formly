import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
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
  const sessionData = await getCurrentSession();

  if (!sessionData || !sessionData.user) {
    redirect("/login");
  }

  const rawSearchParams = await searchParams;
  const validatedParams = parseMyFormsQueryParams(rawSearchParams);

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  // Optional profile displayName
  const userProfile = await prisma.profile.findUnique({
    where: { userId },
    select: { displayName: true },
  });

  const displayName =
    userProfile?.displayName ||
    sessionData.user.name ||
    sessionData.user.username ||
    "Creator";

  const userDTO = {
    id: userId,
    username,
    displayName,
  };

  const formsData = await getMyFormsPage(userId, validatedParams);

  return (
    <AppShell user={userDTO}>
      <MyFormsClient initialData={formsData} queryParams={validatedParams} />
    </AppShell>
  );
}
