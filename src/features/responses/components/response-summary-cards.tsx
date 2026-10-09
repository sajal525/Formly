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
      color: "text-violet-600 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-400",
    },
    {
      title: "Form Views",
      value: kpis.formViews > 0 ? formatCount(kpis.formViews) : "0",
      subtext: "Qualified sessions started",
      icon: Eye,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      title: "Completion Rate",
      value: kpis.completionRate !== null ? `${kpis.completionRate}%` : "Not tracked yet",
      subtext: kpis.completionRate !== null ? "Completed ÷ Started" : "Sessions not recorded",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      title: "Average Time",
      value: formatDuration(kpis.averageTimeSeconds),
      subtext: "Session start to submit",
      icon: Clock,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400",
    },
    {
      title: "Last Response",
      value: formatLastDate(kpis.lastResponseAt),
      subtext: kpis.lastResponseAt ? "Latest submission date" : "Waiting for submission",
      icon: Calendar,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4",
        className
      )}
    >
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  card.color
                )}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
