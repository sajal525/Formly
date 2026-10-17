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
          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
            <Trash2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Trash
          </h1>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          View and manage forms you have deleted. Deleted forms are kept for{" "}
          <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
            {TRASH_RETENTION_DAYS} days
          </span>{" "}
          before being permanently removed.
        </p>
      </div>

      {/* Right Notice Callout */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-xs font-mono text-neutral-600 dark:text-neutral-300 shrink-0">
        <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <span>
          Forms in <strong className="font-semibold text-neutral-900 dark:text-white">trash are only visible to you</strong> (30-day purge).
        </span>
      </div>
    </div>
  );
}
