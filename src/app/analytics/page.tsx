import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
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
  const sessionData = await getCurrentSession();

  if (!sessionData?.user) {
    redirect("/login");
  }

  const rawParams = await searchParams;
  const parsedParamsResult = analyticsQuerySchema.safeParse(rawParams);
  const validatedParams = parsedParamsResult.success
    ? parsedParamsResult.data
    : analyticsQuerySchema.parse({});

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  const [userProfile, analyticsData] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { displayName: true },
    }),
    getFormAnalytics(validatedParams),
  ]);

  if (!analyticsData) {
    redirect("/login");
  }

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
      <AnalyticsWorkspaceClient initialData={analyticsData} />
    </AppShell>
  );
}
