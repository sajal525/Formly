"use client";

import React from "react";
import { Cloud, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { SaveStatus } from "../hooks/use-draft-autosave";

export type AutosaveStatus = SaveStatus;

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSavedAt?: string;
  error?: string | null;
  onRetry?: () => void;
  onReload?: () => void;
}

export function AutosaveIndicator({
  status,
  error,
  onRetry,
  onReload,
}: AutosaveIndicatorProps) {
  if (status === "saving") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#563BFA] dark:text-indigo-400" />
        <span>Saving…</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-[11px] font-medium text-rose-700 dark:text-rose-300">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span className="truncate max-w-[120px] sm:max-w-none">Save failed</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="underline font-bold hover:text-rose-900 dark:hover:text-rose-100 cursor-pointer ml-1"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 text-[11px] font-medium text-amber-700 dark:text-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Conflict</span>
        {onReload && (
          <button
            type="button"
            onClick={onReload}
            className="underline font-bold hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer ml-1"
          >
            Reload
          </button>
        )}
      </div>
    );
  }

  // Saved (Default)
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
      <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>All changes saved</span>
    </div>
  );
}
