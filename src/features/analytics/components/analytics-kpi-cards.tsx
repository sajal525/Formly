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
      bgClass: "bg-[#F0F7FF] dark:bg-[#122238]",
      borderClass: "border-[#DCEBFF] dark:border-[#1E375A]",
      iconBg: "bg-[#DCEBFF] dark:bg-[#1A3860]",
      iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
    },
    {
      ...kpis.views,
      icon: Eye,
      bgClass: "bg-[#FFF0F5] dark:bg-[#2D1622]",
      borderClass: "border-[#FFE0EB] dark:border-[#4B1E34]",
      iconBg: "bg-[#FFE0EB] dark:bg-[#481E32]",
      iconColor: "text-[#E11D48] dark:text-[#FB7185]",
    },
    {
      ...kpis.completionRate,
      icon: TrendingUp,
      bgClass: "bg-[#F0FDF4] dark:bg-[#122A1E]",
      borderClass: "border-[#DCFCE7] dark:border-[#1E4D34]",
      iconBg: "bg-[#DCFCE7] dark:bg-[#1B4D33]",
      iconColor: "text-[#16A34A] dark:text-[#4ADE80]",
    },
    {
      ...kpis.averageTime,
      icon: Clock,
      bgClass: "bg-[#FFF9EE] dark:bg-[#2A2012]",
      borderClass: "border-[#FEEEC8] dark:border-[#463318]",
      iconBg: "bg-[#FEEEC8] dark:bg-[#463318]",
      iconColor: "text-[#D97706] dark:text-[#FBBF24]",
    },
    {
      ...kpis.startedForms,
      icon: UserCheck,
      bgClass: "bg-[#F7F5FF] dark:bg-[#1A1829]",
      borderClass: "border-[#ECE8FF] dark:border-[#2C2849]",
      iconBg: "bg-[#EDE8FF] dark:bg-[#2C2652]",
      iconColor: "text-[#563BFA] dark:text-[#A798FF]",
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
            className={cn(
              "border rounded-xl p-3.5 flex flex-col justify-between transition-all shadow-2xs",
              c.bgClass,
              c.borderClass
            )}
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 truncate">
                  {c.label}
                </span>
                <span
                  title={c.tooltip}
                  className="cursor-help text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0"
                >
                  <Info className="w-3 h-3" />
                </span>
              </div>
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                  c.iconBg,
                  c.iconColor
                )}
              >
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
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : c.deltaType === "negative"
                        ? "text-rose-600 dark:text-rose-400 font-medium"
                        : "text-neutral-400"
                    )}
                  >
                    {c.deltaText}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
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
