"use client";

import React from "react";
import { ResponseTab } from "../schemas/response-query-schema";
import { Table, BarChart2, User, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsesTabBarProps {
  currentTab: ResponseTab;
  onTabChange: (tab: ResponseTab) => void;
  responseCount: number;
}

export function ResponsesTabBar({
  currentTab,
  onTabChange,
  responseCount,
}: ResponsesTabBarProps) {
  const tabs = [
    {
      id: "responses" as ResponseTab,
      label: "Responses",
      icon: Table,
      badge: responseCount > 0 ? responseCount : undefined,
    },
    {
      id: "summary" as ResponseTab,
      label: "Summary",
      icon: BarChart2,
    },
    {
      id: "individual" as ResponseTab,
      label: "Individual View",
      icon: User,
    },
    {
      id: "analytics" as ResponseTab,
      label: "Analytics",
      icon: PieChart,
    },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-[#E5E7EB] dark:border-[#27272A] overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-[2px]",
              isActive
                ? "border-[#563BFA] text-[#563BFA] dark:text-[#8B77FF] font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#1C1F26]"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono leading-none border",
                  isActive
                    ? "bg-[#563BFA]/10 text-[#563BFA] dark:text-[#8B77FF] border-[#563BFA]/30"
                    : "bg-neutral-100 dark:bg-[#1C1F26] text-neutral-600 dark:text-neutral-400 border-[#E5E7EB] dark:border-[#27272A]"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
