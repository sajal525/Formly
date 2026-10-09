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
      color: "text-violet-600 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-400",
    },
    {
      ...kpis.views,
      icon: Eye,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      ...kpis.completionRate,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      ...kpis.averageTime,
      icon: Clock,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400",
    },
    {
      ...kpis.startedForms,
      icon: UserCheck,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4",
        className
      )}
    >
      {cards.map((c, idx) => {
        const IconComponent = c.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {c.label}
                </span>
                <span
                  title={c.tooltip}
                  className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                >
                  <Info className="w-3.5 h-3.5" />
                </span>
              </div>
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  c.color
                )}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            {/* Value & subtext */}
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {c.value}
              </div>

              {/* Delta Comparison Badge */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {c.deltaText ? (
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      c.deltaType === "positive"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : c.deltaType === "negative"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {c.deltaText}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
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
