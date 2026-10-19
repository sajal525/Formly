import React from "react";
import { ResponseSummaryKPIs } from "../server/get-responses-workspace";
import { Users, Eye, TrendingUp, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseSummaryCardsProps {
  kpis: ResponseSummaryKPIs;
  className?: string;
}

export function ResponseSummaryCards({ kpis, className }: ResponseSummaryCardsProps) {
  // Format numbers (e.g. 1200 -> 1.2K)
  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Format seconds to "X min Y sec"
  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "No timing data";
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return remainingSecs > 0 ? `${mins} min ${remainingSecs} sec` : `${mins} min`;
  };

  // Format date to clean display (e.g., 5 Oct 2026)
  const formatLastDate = (isoStr: string | null) => {
    if (!isoStr) return "No responses yet";
    const date = new Date(isoStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cards = [
    {
      title: "Total Responses",
      value: formatCount(kpis.totalResponses),
      subtext: "All-time submissions",
      icon: Users,
      bgClass: "bg-[#F0F7FF] dark:bg-[#122238]",
      borderClass: "border-[#DCEBFF] dark:border-[#1E375A]",
      iconBg: "bg-[#DCEBFF] dark:bg-[#1A3860]",
      iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
    },
    {
      title: "Form Views",
      value: kpis.formViews > 0 ? formatCount(kpis.formViews) : "0",
      subtext: "Qualified sessions started",
      icon: Eye,
      bgClass: "bg-[#FFF0F5] dark:bg-[#2D1622]",
      borderClass: "border-[#FFE0EB] dark:border-[#4B1E34]",
      iconBg: "bg-[#FFE0EB] dark:bg-[#481E32]",
      iconColor: "text-[#E11D48] dark:text-[#FB7185]",
    },
    {
      title: "Completion Rate",
      value: kpis.completionRate !== null ? `${kpis.completionRate}%` : "Not tracked",
      subtext: kpis.completionRate !== null ? "Completed ÷ Started" : "Sessions not recorded",
      icon: TrendingUp,
      bgClass: "bg-[#F0FDF4] dark:bg-[#122A1E]",
      borderClass: "border-[#DCFCE7] dark:border-[#1E4D34]",
      iconBg: "bg-[#DCFCE7] dark:bg-[#1B4D33]",
      iconColor: "text-[#16A34A] dark:text-[#4ADE80]",
    },
    {
      title: "Average Time",
      value: formatDuration(kpis.averageTimeSeconds),
      subtext: "Session start to submit",
      icon: Clock,
      bgClass: "bg-[#FFF9EE] dark:bg-[#2A2012]",
      borderClass: "border-[#FEEEC8] dark:border-[#463318]",
      iconBg: "bg-[#FEEEC8] dark:bg-[#463318]",
      iconColor: "text-[#D97706] dark:text-[#FBBF24]",
    },
    {
      title: "Last Response",
      value: formatLastDate(kpis.lastResponseAt),
      subtext: kpis.lastResponseAt ? "Latest submission date" : "Waiting for submission",
      icon: Calendar,
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
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={cn(
              "border rounded-xl p-3.5 flex flex-col justify-between transition-all shadow-2xs",
              card.bgClass,
              card.borderClass
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {card.title}
              </span>
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                  card.iconBg,
                  card.iconColor
                )}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
                {card.value}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
