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
      bgClass: "bg-[#F7F5FF] dark:bg-[#1A1829]",
      borderClass: "border-[#ECE8FF] dark:border-[#2C2849] hover:border-[#DDD6FE] dark:hover:border-[#3D3766]",
      iconBg: "bg-[#EDE8FF] dark:bg-[#2C2652]",
      iconColor: "text-[#563BFA] dark:text-[#A798FF]",
      waveColor: "text-[#563BFA]",
    },
    {
      title: "Total Responses",
      value: stats.totalResponses,
      formattedValue: formatCompactNumber(stats.totalResponses),
      label: "Across all forms",
      icon: Users,
      href: "/responses",
      bgClass: "bg-[#F0F7FF] dark:bg-[#122238]",
      borderClass: "border-[#DCEBFF] dark:border-[#1E375A] hover:border-[#BFDBFE] dark:hover:border-[#2B4B77]",
      iconBg: "bg-[#DCEBFF] dark:bg-[#1A3860]",
      iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
      waveColor: "text-[#2563EB]",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      formattedValue: formatCompactNumber(stats.totalViews),
      label: "Total sessions",
      icon: Eye,
      href: "/analytics",
      bgClass: "bg-[#FFF0F5] dark:bg-[#2D1622]",
      borderClass: "border-[#FFE0EB] dark:border-[#4B1E34] hover:border-[#FECDD3] dark:hover:border-[#602341]",
      iconBg: "bg-[#FFE0EB] dark:bg-[#481E32]",
      iconColor: "text-[#E11D48] dark:text-[#FB7185]",
      waveColor: "text-[#E11D48]",
    },
    {
      title: "Active Forms",
      value: stats.activeForms,
      formattedValue: formatCompactNumber(stats.activeForms),
      label: `${stats.activeForms} out of ${stats.totalForms}`,
      icon: Clock,
      href: "/my-forms?status=published",
      bgClass: "bg-[#FFF9EE] dark:bg-[#2A2012]",
      borderClass: "border-[#FEEEC8] dark:border-[#463318] hover:border-[#FDE68A] dark:hover:border-[#5C431F]",
      iconBg: "bg-[#FEEEC8] dark:bg-[#463318]",
      iconColor: "text-[#D97706] dark:text-[#FBBF24]",
      waveColor: "text-[#D97706]",
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
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              <div className="space-y-1.5">
                <div className="w-16 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="w-10 h-5 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800" />
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
              "w-full p-4 rounded-xl border transition-all flex items-center justify-between group relative overflow-hidden shadow-2xs",
              card.bgClass,
              card.borderClass,
              isClickable && "cursor-pointer"
            )}
          >
            {/* Subtle aesthetic background wave */}
            <svg
              className={cn(
                "absolute -right-2 -bottom-2 w-32 h-16 pointer-events-none opacity-25 dark:opacity-15",
                card.waveColor
              )}
              viewBox="0 0 200 80"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0,50 C60,20 120,70 200,40 L200,80 L0,80 Z"
                fill="currentColor"
              />
            </svg>

            <div className="flex items-center gap-3.5 min-w-0 relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                  card.iconBg,
                  card.iconColor
                )}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  {card.title}
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight leading-none mt-1">
                  {card.formattedValue}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-1 truncate">
                  {card.label}
                </div>
              </div>
            </div>

            {isClickable && (
              <div className="w-7 h-7 rounded-full bg-white/90 dark:bg-white/10 shadow-xs border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-400 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:scale-105 transition-all shrink-0 ml-2 relative z-10">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
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
