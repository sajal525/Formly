"use client";

import React from "react";
import { FileText, TrendingUp, Eye, LayoutGrid } from "lucide-react";
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
      label: "Templates Used",
      value: stats.templatesUsed,
      icon: LayoutGrid,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/50",
      borderColor: "border-rose-100 dark:border-rose-900/30",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Account Stats
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real activity across your active forms.
          </p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          All time
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`p-3.5 rounded-2xl ${item.bgColor} border ${item.borderColor} flex flex-col justify-between transition-transform duration-150 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="mt-2.5">
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
