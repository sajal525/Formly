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
    <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap -mb-[2px]",
              isActive
                ? "border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/40 dark:bg-violet-950/20 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-900"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                  isActive
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
