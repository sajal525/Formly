import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-dal";
import { FormlyLogo } from "@/components/branding/formly-logo";
import { ThemeToggle } from "@/components/branding/theme-toggle";
import { SignOutButton } from "./sign-out-button";
import { CheckCircle2, Shield, User as UserIcon, Calendar, Database } from "lucide-react";

export default async function DashboardPage() {
  const sessionData = await getCurrentSession();

  if (!sessionData || !sessionData.user) {
    redirect("/login");
  }

  const { user } = sessionData;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[var(--page-bg)] text-[var(--body-text)] transition-colors duration-300">
      {/* Top Header */}
      <header className="w-full px-4 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20 h-16 flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 backdrop-blur-md bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <FormlyLogo size="md" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center items-center text-center">
        <div className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[28px] p-8 sm:p-12 border border-slate-200/80 dark:border-white/10 shadow-xl space-y-8">
          {/* Success Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Protected Destination — Authenticated Session Active</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#329CF5] via-[#563BFA] to-[#BD45E8] bg-clip-text text-transparent">
                {user.name || user.username || "Creator"}
              </span>
              !
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              You are signed in with a server-managed session verified through Neon PostgreSQL and Better Auth.
            </p>
          </div>

          {/* Account Details Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <UserIcon className="w-3.5 h-3.5 text-[#563BFA]" />
                <span>Username</span>
              </div>
              <div className="text-sm font-bold text-[var(--ink)] truncate">
                {user.username || user.name}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Shield className="w-3.5 h-3.5 text-[#329CF5]" />
                <span>Account ID</span>
              </div>
              <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">
                {user.id}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Storage</span>
              </div>
              <div className="text-sm font-bold text-[var(--ink)]">
                Neon Cloud DB
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Part 2: Registration & Shared Login Backend Complete</span>
            <span>Dashboard & Form Builder will be configured in next step</span>
          </div>
        </div>
      </main>

      <footer className="h-10 shrink-0" />
    </div>
  );
}
