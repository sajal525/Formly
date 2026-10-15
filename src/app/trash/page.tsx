import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-dal";
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
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const rawParams = await searchParams;
  const parsedParams = trashQueryParamsSchema.parse({
    type: rawParams.type,
    q: rawParams.q,
    sort: rawParams.sort,
    page: rawParams.page,
    pageSize: rawParams.pageSize,
  });

  const trashData = await getTrashPage(user.id, parsedParams);

  return (
    <AppShell user={user}>
      <TrashWorkspaceClient
        initialData={trashData}
        queryParams={parsedParams}
      />
    </AppShell>
  );
}
