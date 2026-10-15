import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-dal";
import { AppShell } from "@/components/app-shell/app-shell";
import { analyticsQuerySchema } from "@/features/analytics/schemas/analytics-query-schema";
import { getFormAnalytics } from "@/features/analytics/server/get-form-analytics";
import { AnalyticsWorkspaceClient } from "@/features/analytics/components/analytics-workspace-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Formly",
  description: "Get detailed insights and understand your form performance with Formly.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const rawParams = await searchParams;
  const parsedParamsResult = analyticsQuerySchema.safeParse(rawParams);
  const validatedParams = parsedParamsResult.success
    ? parsedParamsResult.data
    : analyticsQuerySchema.parse({});

  const analyticsData = await getFormAnalytics(validatedParams);

  if (!analyticsData) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <AnalyticsWorkspaceClient initialData={analyticsData} />
    </AppShell>
  );
}
