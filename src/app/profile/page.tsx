import React from "react";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth-dal";
import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentProfile } from "@/features/profile/server/get-current-profile";
import { getAccountStats } from "@/features/profile/server/get-account-stats";
import { ProfileWorkspaceClient } from "@/features/profile/components/profile-workspace-client";

export const metadata: Metadata = {
  title: "Profile | Formly",
  description: "Manage your account information, profile details and preferences.",
};

export default async function ProfilePage() {
  const sessionData = await getCurrentSession();

  if (!sessionData?.user) {
    redirect("/login");
  }

  const userId = sessionData.user.id;
  const username =
    sessionData.user.username ||
    sessionData.user.name ||
    "Creator";

  const [profile, stats] = await Promise.all([
    getCurrentProfile(),
    getAccountStats(userId),
  ]);

  if (!profile) {
    redirect("/login");
  }

  const displayName = profile.displayName || username;

  const userDTO = {
    id: userId,
    username,
    displayName,
  };

  return (
    <AppShell user={userDTO}>
      <ProfileWorkspaceClient initialProfile={profile} stats={stats} />
    </AppShell>
  );
}
