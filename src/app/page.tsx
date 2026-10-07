import React from "react";
import { getCurrentUser } from "../lib/auth";
import { getTemplates, listForms } from "../server/forms.queries";
import { getFolders } from "../server/folders.queries";
import { HomePageClient } from "../components/home/HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [templateRecords, initialForms, folderRecords] = await Promise.all([
    getTemplates(),
    listForms(user.id),
    getFolders(user.id),
  ]);

  const templates = templateRecords.map((t) => ({
    id: t.id,
    name: t.name,
    headerColor: t.headerColor || "#6366F1",
  }));

  const initialFolders = folderRecords.map((f) => ({
    id: f.id,
    name: f.name,
    formCount: f.formCount,
  }));

  return (
    <HomePageClient
      templates={templates}
      initialForms={initialForms}
      initialFolders={initialFolders}
    />
  );
}

