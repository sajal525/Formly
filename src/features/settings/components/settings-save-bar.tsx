"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  saveStatus: "idle" | "saved" | "error";
  onSave: () => void;
  onDiscard: () => void;
  className?: string;
}

export function SettingsSaveBar({
  isDirty,
  isSaving,
  saveStatus,
  onSave,
  onDiscard,
  className,
}: SettingsSaveBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {saveStatus === "saved" ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            Settings saved successfully
          </span>
        ) : saveStatus === "error" ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
            Failed to save settings. Please try again.
          </span>
        ) : isDirty ? (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            You have unsaved changes
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            All preferences up to date
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-3 h-9"
          >
            Discard
          </Button>
        )}

        <Button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={cn(
            "rounded-xl px-5 h-9 text-xs font-semibold transition-all shadow-xs gap-1.5",
            isDirty && !isSaving
              ? "bg-[#563BFA] hover:bg-indigo-700 text-white"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </div>
    </div>
  );
}
