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
    <div className="h-14 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between select-none transition-colors">
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
                "h-full px-3 sm:px-4 flex items-center gap-2 text-xs sm:text-sm font-semibold relative transition-all border-b-2",
                isActive
                  ? "border-violet-600 text-violet-600 dark:text-violet-400 font-bold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                )}
              />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
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
