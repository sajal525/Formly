"use client";

import React from "react";
import { Trash2, Info } from "lucide-react";
import { TRASH_RETENTION_DAYS } from "../server/trash-constants";

export function TrashHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trash
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View and manage forms you have deleted. Deleted forms are kept for{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {TRASH_RETENTION_DAYS} days
          </span>{" "}
          before being permanently removed.
        </p>
      </div>

      {/* Right Notice Callout */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 shrink-0">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>
          Forms in <strong className="font-semibold">trash are only visible to you</strong> and will be permanently deleted after {TRASH_RETENTION_DAYS} days.
        </span>
      </div>
    </div>
  );
}
