"use client";

import React from "react";
import { Archive, X, CheckSquare } from "lucide-react";

interface BulkSelectionBarProps {
  selectedCount: number;
  onArchiveSelected: () => void;
  onClearSelection: () => void;
}

export function BulkSelectionBar({
  selectedCount,
  onArchiveSelected,
  onClearSelection,
}: BulkSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="p-3 sm:px-4 rounded-xl bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-150">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-[#563BFA]/10 dark:bg-[#563BFA]/20 text-[#563BFA] dark:text-[#8B77FF] border border-[#563BFA]/30 flex items-center justify-center shrink-0">
          <CheckSquare className="w-3.5 h-3.5" />
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-mono font-bold text-neutral-900 dark:text-white">
            {selectedCount}
          </span>{" "}
          form{selectedCount === 1 ? "" : "s"} selected
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onArchiveSelected}
          className="h-7 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive selected</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="h-7 px-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] hover:bg-neutral-100 dark:hover:bg-[#1C1F26] text-neutral-600 dark:text-neutral-400 text-xs font-medium flex items-center gap-1 transition-colors"
          title="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Deselect</span>
        </button>
      </div>
    </div>
  );
}
