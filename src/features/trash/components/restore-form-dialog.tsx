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
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-[#563BFA]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Restore "{item.title}"?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Moving this form back to your workspace will preserve all questions and responses.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {wasPublished && (
          <div
            data-testid="published-restore-notice"
            className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5"
          >
            <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice for Published Form</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Restoring to its previous status will reactivate its public link and allow respondents to submit answers again.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300 block">
            Select restoration state:
          </label>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                restoreAs === "previous_status"
                  ? "border-violet-500 bg-violet-50/20 dark:bg-violet-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <input
                type="radio"
                name="restoreAs"
                value="previous_status"
                checked={restoreAs === "previous_status"}
                onChange={() => setRestoreAs("previous_status")}
                className="mt-0.5 text-violet-600 focus:ring-violet-500"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Restore to previous status ({prevStatusLabel})
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Restores the exact status before moving to Trash.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                restoreAs === "draft"
                  ? "border-violet-500 bg-violet-50/20 dark:bg-violet-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <input
                type="radio"
                name="restoreAs"
                value="draft"
                checked={restoreAs === "draft"}
                onChange={() => setRestoreAs("draft")}
                className="mt-0.5 text-violet-600 focus:ring-violet-500"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Restore as Draft
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Safer option: keeps the form private until you choose to publish it again.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            id="confirm-restore-btn"
            type="button"
            onClick={() => onConfirm(item, restoreAs)}
            disabled={isSubmitting}
            className="rounded-xl bg-[#563BFA] hover:bg-violet-700 text-white text-xs font-semibold gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
