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
    <div className="p-3 sm:px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#563BFA] text-white flex items-center justify-center shrink-0">
          <CheckSquare className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          <span className="font-bold text-[#563BFA] dark:text-indigo-400">
            {selectedCount}
          </span>{" "}
          form{selectedCount === 1 ? "" : "s"} selected on this page
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onArchiveSelected}
          className="h-8 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive selected</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="h-8 px-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Clear selection"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Deselect</span>
        </button>
      </div>
    </div>
  );
}
