import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell/app-shell";
import { trashQueryParamsSchema } from "@/features/trash/schemas/trash-query-schema";
import { getTrashPage } from "@/features/trash/server/get-trash-page";
import { TrashWorkspaceClient } from "@/features/trash/components/trash-workspace-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trash | Formly",
  description: "View and manage forms you have deleted.",
};

interface TrashPageProps {
  searchParams: Promise<{
    type?: string;
    q?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function TrashPage({ searchParams }: TrashPageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData?.user) {
    redirect("/login");
  }

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

  const rawParams = await searchParams;
  const parsedParams = trashQueryParamsSchema.parse({
    type: rawParams.type,
    q: rawParams.q,
    sort: rawParams.sort,
    page: rawParams.page,
    pageSize: rawParams.pageSize,
  });

  const trashData = await getTrashPage(userId, parsedParams);

  return (
    <AppShell user={userDTO}>
      <TrashWorkspaceClient
        initialData={trashData}
        queryParams={parsedParams}
      />
    </AppShell>
  );
}
