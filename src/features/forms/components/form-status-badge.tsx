import React from "react";
import { FormStatus } from "@prisma/client";

interface FormStatusBadgeProps {
  status: FormStatus;
  className?: string;
}

export function FormStatusBadge({ status, className = "" }: FormStatusBadgeProps) {
  const config = {
    DRAFT: {
      label: "Draft",
      badgeStyle:
        "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      dotStyle: "bg-slate-400",
    },
    PUBLISHED: {
      label: "Published",
      badgeStyle:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
      dotStyle: "bg-emerald-500",
    },
    CLOSED: {
      label: "Closed",
      badgeStyle:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50",
      dotStyle: "bg-rose-500",
    },
    ARCHIVED: {
      label: "Archived",
      badgeStyle:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
      dotStyle: "bg-amber-500",
    },
    TRASHED: {
      label: "Trashed",
      badgeStyle:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
      dotStyle: "bg-red-500",
    },
  }[status] || {
    label: status,
    badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
    dotStyle: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotStyle}`} />
      <span>{config.label}</span>
    </span>
  );
}
