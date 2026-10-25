"use client";

import React from "react";
import { FileEdit, Palette, Settings as SettingsIcon, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type BuilderTab = "questions" | "theme" | "settings" | "preview";

interface BuilderTabsProps {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  questionCount?: number;
  onImportWithAi?: () => void;
}

export function BuilderTabs({
  activeTab,
  onTabChange,
  questionCount = 0,
  onImportWithAi,
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
      <nav className="flex items-center gap-1 sm:gap-2 h-full overflow-x-auto no-scrollbar" aria-label="Editor tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <React.Fragment key={tab.id}>
              {tab.id === "preview" && (
                <button
                  type="button"
                  onClick={onImportWithAi}
                  aria-label="Import with AI"
                  className="my-auto h-7 px-3 flex items-center gap-1.5 text-xs font-mono font-medium rounded-full bg-[#EDE9FE] hover:bg-[#E2D8FF] active:bg-[#D7CBFF] dark:bg-[#563BFA]/20 dark:hover:bg-[#563BFA]/30 text-[#563BFA] dark:text-[#C4B5FD] border border-[#DDD2FF]/80 dark:border-[#563BFA]/30 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#563BFA] dark:focus-visible:ring-[#8E7CFD] focus-visible:ring-offset-1 select-none shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#563BFA] dark:text-[#C4B5FD] shrink-0" />
                  <span>Import with AI</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "h-full px-3 flex items-center gap-1.5 text-xs font-mono font-medium relative transition-all border-b-2 shrink-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#563BFA]",
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
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
