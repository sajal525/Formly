import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell/app-shell";
import { parseTemplateQueryParams } from "@/features/templates/schemas/template-query-schema";
import { getTemplateCatalog } from "@/features/templates/server/get-template-catalog";
import { TemplatesClient } from "@/features/templates/components/templates-client";

export const metadata = {
  title: "Templates | Formly",
  description: "Browse professionally designed templates or start with a blank form.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData || !sessionData.user) {
    redirect("/login");
  }

  const rawSearchParams = await searchParams;
  const validatedParams = parseTemplateQueryParams(rawSearchParams);

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  const [userProfile, catalogData] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { displayName: true },
    }),
    getTemplateCatalog(validatedParams),
  ]);

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

  return (
    <AppShell user={userDTO}>
      <TemplatesClient
        initialCatalog={catalogData}
        queryParams={validatedParams}
      />
    </AppShell>
  );
}
