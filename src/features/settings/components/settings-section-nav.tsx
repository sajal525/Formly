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
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-2",
        className
      )}
    >
      <nav className="space-y-0.5" aria-label="Settings categories">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors group",
                isActive
                  ? "bg-[#563BFA]/10 text-[#563BFA] dark:text-[#8B77FF] font-semibold border border-[#563BFA]/20"
                  : sec.isAvailable
                  ? "hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-700 dark:text-neutral-300 border border-transparent"
                  : "opacity-60 hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-400 dark:text-neutral-500 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 border",
                    isActive
                      ? "bg-[#563BFA] text-white border-[#563BFA]"
                      : "bg-neutral-100 dark:bg-[#1C1F26] border-[#E5E7EB] dark:border-[#27272A] text-neutral-500"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate leading-tight">
                    {sec.label}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                    {sec.subtext}
                  </div>
                </div>
              </div>

              {!sec.isAvailable && (
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-100 dark:bg-[#1C1F26] text-neutral-400 shrink-0">
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
