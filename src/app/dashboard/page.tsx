import React from "react";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/dashboard/server/get-dashboard-data";
import { AppShell } from "@/components/app-shell/app-shell";
import { DashboardClient } from "@/features/dashboard/components/dashboard-client";

export const metadata = {
  title: "Dashboard | Formly",
  description: "Create, share and collect responses with Formly.",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  return (
    <AppShell user={data.user}>
      <DashboardClient initialData={data} />
    </AppShell>
  );
}
