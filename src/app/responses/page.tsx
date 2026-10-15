import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-dal";
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
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const rawParams = await searchParams;
  const parsedParamsResult = responseWorkspaceQuerySchema.safeParse(rawParams);
  const validatedParams = parsedParamsResult.success
    ? parsedParamsResult.data
    : responseWorkspaceQuerySchema.parse({});

  const workspaceData = await getResponsesWorkspace(validatedParams);

  if (!workspaceData) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
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
