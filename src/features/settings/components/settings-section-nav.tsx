"use client";

import React from "react";
import {
  Sliders,
  Palette,
  Bell,
  ShieldCheck,
  FileText,
  FileCheck,
  Users,
  Share2,
  Database,
  Globe,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type SettingsSection =
  | "general"
  | "appearance"
  | "notifications"
  | "privacy"
  | "form-preferences"
  | "autofill"
  | "collaborators"
  | "integrations"
  | "data-storage"
  | "language-region"
  | "account";

interface SettingsSectionNavProps {
  activeSection: SettingsSection;
  onSelectSection: (section: SettingsSection) => void;
  className?: string;
}

export function SettingsSectionNav({
  activeSection,
  onSelectSection,
  className,
}: SettingsSectionNavProps) {
  const sections: {
    id: SettingsSection;
    label: string;
    subtext: string;
    icon: React.ComponentType<{ className?: string }>;
    isAvailable: boolean;
    linkTo?: string;
  }[] = [
    {
      id: "general",
      label: "General",
      subtext: "Basic preferences",
      icon: Sliders,
      isAvailable: true,
    },
    {
      id: "appearance",
      label: "Appearance",
      subtext: "Theme and display",
      icon: Palette,
      isAvailable: true,
    },
    {
      id: "notifications",
      label: "Notifications",
      subtext: "Email and in-app alerts",
      icon: Bell,
      isAvailable: true,
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      subtext: "Manage privacy and security",
      icon: ShieldCheck,
      isAvailable: false,
    },
    {
      id: "form-preferences",
      label: "Form Preferences",
      subtext: "Default form settings",
      icon: FileText,
      isAvailable: true,
    },
    {
      id: "autofill",
      label: "Auto-Fill",
      subtext: "Saved information for forms",
      icon: FileCheck,
      isAvailable: false,
    },
    {
      id: "collaborators",
      label: "Collaborators",
      subtext: "Manage shared access",
      icon: Users,
      isAvailable: false,
    },
    {
      id: "integrations",
      label: "Integrations",
      subtext: "Connect with other apps",
      icon: Share2,
      isAvailable: false,
    },
    {
      id: "data-storage",
      label: "Data & Storage",
      subtext: "Manage your data",
      icon: Database,
      isAvailable: false,
    },
    {
      id: "language-region",
      label: "Language & Region",
      subtext: "Language and timezone",
      icon: Globe,
      isAvailable: true,
    },
    {
      id: "account",
      label: "Account",
      subtext: "Account management",
      icon: User,
      isAvailable: false,
    },
  ];

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs",
        className
      )}
    >
      <nav className="space-y-1" aria-label="Settings categories">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={cn(
                "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group",
                isActive
                  ? "bg-[#EEF0FF] dark:bg-indigo-950/60 text-[#563BFA] dark:text-indigo-400 font-semibold shadow-xs"
                  : sec.isAvailable
                  ? "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  : "opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-400 dark:text-slate-500"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isActive
                      ? "bg-violet-100 dark:bg-indigo-900/50 text-[#563BFA] dark:text-indigo-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate leading-tight">
                    {sec.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {sec.subtext}
                  </div>
                </div>
              </div>

              {!sec.isAvailable && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 shrink-0">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
