"use client";

import React from "react";
import { AnalyticsKpiCardDTO } from "../server/get-form-analytics";
import {
  Users,
  Eye,
  TrendingUp,
  Clock,
  UserCheck,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsKpiCardsProps {
  kpis: {
    responses: AnalyticsKpiCardDTO;
    views: AnalyticsKpiCardDTO;
    completionRate: AnalyticsKpiCardDTO;
    averageTime: AnalyticsKpiCardDTO;
    startedForms: AnalyticsKpiCardDTO;
  };
  className?: string;
}

export function AnalyticsKpiCards({ kpis, className }: AnalyticsKpiCardsProps) {
  const cards = [
    {
      ...kpis.responses,
      icon: Users,
    },
    {
      ...kpis.views,
      icon: Eye,
    },
    {
      ...kpis.completionRate,
      icon: TrendingUp,
    },
    {
      ...kpis.averageTime,
      icon: Clock,
    },
    {
      ...kpis.startedForms,
      icon: UserCheck,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5",
        className
      )}
    >
      {cards.map((c, idx) => {
        const IconComponent = c.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-3.5 flex flex-col justify-between"
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
                  {c.label}
                </span>
                <span
                  title={c.tooltip}
                  className="cursor-help text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0"
                >
                  <Info className="w-3 h-3" />
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-500 dark:text-neutral-400 flex items-center justify-center shrink-0">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Value & subtext */}
            <div className="space-y-0.5">
              <div className="text-xl font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
                {c.value}
              </div>

              {/* Delta Comparison Badge */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {c.deltaText ? (
                  <span
                    className={cn(
                      "text-[10px] font-mono",
                      c.deltaType === "positive"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : c.deltaType === "negative"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-neutral-400"
                    )}
                  >
                    {c.deltaText}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-400">
                    {c.subtext}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
