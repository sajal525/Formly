"use client";

import React from "react";
import Link from "next/link";
import { FileText, Users, Eye, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    totalForms: number;
    draftForms: number;
    activeForms: number;
    totalResponses: number;
    totalViews: number;
  };
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  const cards = [
    {
      title: "Total Forms",
      value: stats.totalForms,
      formattedValue: formatCompactNumber(stats.totalForms),
      label: "All created forms",
      icon: FileText,
      href: "/my-forms",
    },
    {
      title: "Total Responses",
      value: stats.totalResponses,
      formattedValue: formatCompactNumber(stats.totalResponses),
      label: "Across all forms",
      icon: Users,
      href: "/responses",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      formattedValue: formatCompactNumber(stats.totalViews),
      label: "Total sessions",
      icon: Eye,
      href: "/analytics",
    },
    {
      title: "Active Forms",
      value: stats.activeForms,
      formattedValue: formatCompactNumber(stats.activeForms),
      label: `${stats.activeForms} out of ${stats.totalForms}`,
      icon: Clock,
      href: "/my-forms?status=published",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <div className="space-y-1.5">
                <div className="w-16 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="w-10 h-5 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
            <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = Boolean(card.href);

        const cardContent = (
          <div
            className={cn(
              "w-full p-4 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group",
              isClickable && "cursor-pointer"
            )}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  {card.title}
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight leading-none mt-1">
                  {card.formattedValue}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 truncate">
                  {card.label}
                </div>
              </div>
            </div>

            {isClickable && (
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
            )}
          </div>
        );

        if (isClickable && card.href) {
          return (
            <Link
              key={card.title}
              href={card.href}
              prefetch={true}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 rounded-xl"
            >
              {cardContent}
            </Link>
          );
        }

        return <div key={card.title}>{cardContent}</div>;
      })}
    </div>
  );
}
