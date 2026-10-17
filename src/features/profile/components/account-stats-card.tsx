"use client";

import React from "react";
import { FileText, TrendingUp, Eye, FileEdit } from "lucide-react";
import { AccountStatsDTO } from "../schemas/profile-schema";

interface AccountStatsCardProps {
  stats: AccountStatsDTO;
}

export function AccountStatsCard({ stats }: AccountStatsCardProps) {
  const statItems = [
    {
      label: "Total Forms",
      value: stats.totalForms,
      icon: FileText,
      color: "text-[#563BFA] dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      borderColor: "border-indigo-100 dark:border-indigo-900/30",
    },
    {
      label: "Total Responses",
      value: stats.totalResponses,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      borderColor: "border-emerald-100 dark:border-emerald-900/30",
    },
    {
      label: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-950/50",
      borderColor: "border-sky-100 dark:border-sky-900/30",
    },
    {
      label: "Draft Forms",
      value: stats.draftForms,
      icon: FileEdit,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/50",
      borderColor: "border-rose-100 dark:border-rose-900/30",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A] p-5">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB] dark:border-[#27272A]">
        <div>
          <h2 className="text-xs font-semibold text-neutral-900 dark:text-white">
            Account Stats
          </h2>
          <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
            Real activity across your active forms.
          </p>
        </div>
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-100 dark:bg-[#1C1F26] text-neutral-500">
          All time
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-6 h-6 rounded-md bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center text-neutral-500">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-lg font-mono font-bold text-neutral-900 dark:text-white">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
