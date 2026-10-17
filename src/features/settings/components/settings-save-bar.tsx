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
        "flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {saveStatus === "saved" ? (
          <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            Settings saved
          </span>
        ) : saveStatus === "error" ? (
          <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed to save settings.
          </span>
        ) : isDirty ? (
          <span className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
        ) : (
          <span className="text-xs font-mono text-neutral-400">
            All preferences up to date
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1C1F26] rounded-md px-2.5 h-7"
          >
            Discard
          </Button>
        )}

        <Button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={cn(
            "rounded-md px-3.5 h-7 text-xs font-mono font-medium transition-colors gap-1.5 border",
            isDirty && !isSaving
              ? "bg-[#563BFA] hover:bg-[#482fe0] text-white border-[#563BFA]"
              : "bg-neutral-100 text-neutral-400 dark:bg-[#1C1F26] dark:text-neutral-600 border-[#E5E7EB] dark:border-[#27272A] cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </Button>
      </div>
    </div>
  );
}
