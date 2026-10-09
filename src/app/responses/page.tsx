import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell/app-shell";
import {
  responseWorkspaceQuerySchema,
} from "@/features/responses/schemas/response-query-schema";
import { getResponsesWorkspace } from "@/features/responses/server/get-responses-workspace";
import { ResponsesWorkspaceClient } from "@/features/responses/components/responses-workspace-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responses | Formly",
  description: "View and manage submissions from your forms with Formly.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResponsesPage({ searchParams }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData?.user) {
    redirect("/login");
  }

  const rawParams = await searchParams;
  const parsedParamsResult = responseWorkspaceQuerySchema.safeParse(rawParams);
  const validatedParams = parsedParamsResult.success
    ? parsedParamsResult.data
    : responseWorkspaceQuerySchema.parse({});

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

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

  const workspaceData = await getResponsesWorkspace(validatedParams);

  if (!workspaceData) {
    redirect("/login");
  }

  return (
    <AppShell user={userDTO}>
      <ResponsesWorkspaceClient
        initialData={workspaceData}
        currentTab={validatedParams.tab}
        currentSort={validatedParams.sort}
        currentPageSize={validatedParams.pageSize}
        currentDateRange={validatedParams.dateRange}
        currentSearch={validatedParams.search}
        currentResponseId={validatedParams.responseId}
      />
    </AppShell>
  );
}
