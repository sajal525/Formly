import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-dal";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentSettings } from "@/features/settings/server/get-current-settings";
import { SettingsWorkspaceClient } from "@/features/settings/components/settings-workspace-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Formly",
  description: "Customize your Formly experience and manage your preferences.",
};

export default async function SettingsPage() {
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

  const settings = await getCurrentSettings();

  if (!settings) {
    redirect("/login");
  }

  return (
    <AppShell user={userDTO}>
      <SettingsWorkspaceClient initialSettings={settings} />
    </AppShell>
  );
}
