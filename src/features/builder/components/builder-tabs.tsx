"use client";

import React from "react";
import { FileEdit, Palette, Settings as SettingsIcon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type BuilderTab = "questions" | "theme" | "settings" | "preview";

interface BuilderTabsProps {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  questionCount?: number;
}

export function BuilderTabs({
  activeTab,
  onTabChange,
  questionCount = 0,
}: BuilderTabsProps) {
  const tabs = [
    {
      id: "questions" as BuilderTab,
      label: "Questions",
      icon: FileEdit,
      count: questionCount,
    },
    {
      id: "theme" as BuilderTab,
      label: "Theme",
      icon: Palette,
    },
    {
      id: "settings" as BuilderTab,
      label: "Settings",
      icon: SettingsIcon,
    },
    {
      id: "preview" as BuilderTab,
      label: "Preview",
      icon: Eye,
    },
  ];

  return (
    <div className="h-10 shrink-0 bg-white dark:bg-[#121417] border-b border-[#E5E7EB] dark:border-[#27272A] px-4 sm:px-6 flex items-center justify-between select-none transition-colors">
      <nav className="flex items-center gap-1 sm:gap-2 h-full" aria-label="Editor tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "h-full px-3 flex items-center gap-1.5 text-xs font-mono font-medium relative transition-all border-b-2",
                isActive
                  ? "border-[#563BFA] text-[#563BFA] dark:text-[#a594fd] font-semibold"
                  : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5",
                  isActive ? "text-[#563BFA] dark:text-[#a594fd]" : "text-neutral-400"
                )}
              />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded border",
                    isActive
                      ? "bg-[#563BFA]/10 text-[#563BFA] dark:text-[#a594fd] border-[#563BFA]/30"
                      : "bg-neutral-100 dark:bg-[#181B20] text-neutral-500 dark:text-neutral-400 border-[#E5E7EB] dark:border-[#27272A]"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
