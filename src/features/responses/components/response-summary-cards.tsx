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
    },
    {
      title: "Form Views",
      value: kpis.formViews > 0 ? formatCount(kpis.formViews) : "0",
      subtext: "Qualified sessions started",
      icon: Eye,
    },
    {
      title: "Completion Rate",
      value: kpis.completionRate !== null ? `${kpis.completionRate}%` : "Not tracked",
      subtext: kpis.completionRate !== null ? "Completed ÷ Started" : "Sessions not recorded",
      icon: TrendingUp,
    },
    {
      title: "Average Time",
      value: formatDuration(kpis.averageTimeSeconds),
      subtext: "Session start to submit",
      icon: Clock,
    },
    {
      title: "Last Response",
      value: formatLastDate(kpis.lastResponseAt),
      subtext: kpis.lastResponseAt ? "Latest submission date" : "Waiting for submission",
      icon: Calendar,
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
            className="bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-3.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {card.title}
              </span>
              <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-500 dark:text-neutral-400 flex items-center justify-center shrink-0">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
                {card.value}
              </div>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
