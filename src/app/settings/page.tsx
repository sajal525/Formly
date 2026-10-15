import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-dal";
import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentSettings } from "@/features/settings/server/get-current-settings";
import { SettingsWorkspaceClient } from "@/features/settings/components/settings-workspace-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Formly",
  description: "Customize your Formly experience and manage your preferences.",
};

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await getCurrentSettings();

  if (!settings) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <SettingsWorkspaceClient initialSettings={settings} />
    </AppShell>
  );
}
