"use client";

import React, { useState } from "react";
import { TrashItemDTO } from "../server/get-trash-page";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2, Globe, X } from "lucide-react";

interface RestoreFormDialogProps {
  item: TrashItemDTO | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (item: TrashItemDTO, restoreAs: "previous_status" | "draft") => void;
}

export function RestoreFormDialog({
  item,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: RestoreFormDialogProps) {
  const [restoreAs, setRestoreAs] = useState<"previous_status" | "draft">(
    "previous_status"
  );

  if (!isOpen || !item) return null;

  const wasPublished = item.statusBeforeTrash === "PUBLISHED";
  const prevStatusLabel = item.statusBeforeTrash || "Draft";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#121417] rounded-xl p-6 shadow-xl border border-[#E5E7EB] dark:border-[#27272A] space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                Restore "{item.title}"?
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                Preserves all questions and response records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#181B20] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {wasPublished && (
          <div
            data-testid="published-restore-notice"
            className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2.5"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Notice for Published Form</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                Restoring to its previous status will reactivate its public link.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 text-xs">
          <label className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold block">
            Select restoration state:
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                restoreAs === "previous_status"
                  ? "border-[#563BFA] bg-[#563BFA]/5"
                  : "border-[#E5E7EB] dark:border-[#27272A] hover:bg-neutral-50 dark:hover:bg-[#181B20]"
              }`}
            >
              <input
                type="radio"
                name="restoreAs"
                value="previous_status"
                checked={restoreAs === "previous_status"}
                onChange={() => setRestoreAs("previous_status")}
                className="mt-0.5 text-[#563BFA] focus:ring-[#563BFA]"
              />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white block">
                  Restore to previous status ({prevStatusLabel})
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5 font-mono">
                  Restores the exact status before moving to Trash.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                restoreAs === "draft"
                  ? "border-[#563BFA] bg-[#563BFA]/5"
                  : "border-[#E5E7EB] dark:border-[#27272A] hover:bg-neutral-50 dark:hover:bg-[#181B20]"
              }`}
            >
              <input
                type="radio"
                name="restoreAs"
                value="draft"
                checked={restoreAs === "draft"}
                onChange={() => setRestoreAs("draft")}
                className="mt-0.5 text-[#563BFA] focus:ring-[#563BFA]"
              />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white block">
                  Restore as Draft
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5 font-mono">
                  Safer option: keeps the form private until you choose to publish it again.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 font-mono">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            id="confirm-restore-btn"
            type="button"
            onClick={() => onConfirm(item, restoreAs)}
            disabled={isSubmitting}
            className="rounded-lg bg-[#563BFA] hover:bg-[#4830d9] text-white text-xs font-medium gap-1.5 h-8 shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Restoring...</span>
              </>
            ) : (
              <span>Restore Form</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
