"use client";

import React from "react";
import { FileText, TrendingUp, Eye, FileEdit } from "lucide-react";
import { AccountStatsDTO } from "../schemas/profile-schema";
import { cn } from "@/lib/utils";

interface AccountStatsCardProps {
  stats: AccountStatsDTO;
}

export function AccountStatsCard({ stats }: AccountStatsCardProps) {
  const statItems = [
    {
      label: "Total Forms",
      value: stats.totalForms,
      icon: FileText,
      color: "text-[#563BFA] dark:text-[#A798FF]",
      bgColor: "bg-[#F7F5FF] dark:bg-[#1A1829]",
      borderColor: "border-[#ECE8FF] dark:border-[#2C2849]",
      iconBg: "bg-[#EDE8FF] dark:bg-[#2C2652]",
    },
    {
      label: "Total Responses",
      value: stats.totalResponses,
      icon: TrendingUp,
      color: "text-[#2563EB] dark:text-[#60A5FA]",
      bgColor: "bg-[#F0F7FF] dark:bg-[#122238]",
      borderColor: "border-[#DCEBFF] dark:border-[#1E375A]",
      iconBg: "bg-[#DCEBFF] dark:bg-[#1A3860]",
    },
    {
      label: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      color: "text-[#E11D48] dark:text-[#FB7185]",
      bgColor: "bg-[#FFF0F5] dark:bg-[#2D1622]",
      borderColor: "border-[#FFE0EB] dark:border-[#4B1E34]",
      iconBg: "bg-[#FFE0EB] dark:bg-[#481E32]",
    },
    {
      label: "Draft Forms",
      value: stats.draftForms,
      icon: FileEdit,
      color: "text-[#D97706] dark:text-[#FBBF24]",
      bgColor: "bg-[#FFF9EE] dark:bg-[#2A2012]",
      borderColor: "border-[#FEEEC8] dark:border-[#463318]",
      iconBg: "bg-[#FEEEC8] dark:bg-[#463318]",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A] p-5 shadow-2xs">
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
              className={cn(
                "p-3 rounded-lg border flex flex-col justify-between shadow-2xs transition-all",
                item.bgColor,
                item.borderColor
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-xs",
                    item.iconBg,
                    item.color
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-lg font-mono font-bold text-neutral-900 dark:text-white">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
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
