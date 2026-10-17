"use client";

import React, { useState, useEffect } from "react";
import { TrashItemDTO } from "../server/get-trash-page";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface PermanentDeleteDialogProps {
  item: TrashItemDTO | null;
  bulkCount?: number;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (confirmText: string) => void;
}

export function PermanentDeleteDialog({
  item,
  bulkCount,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: PermanentDeleteDialogProps) {
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmInput("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isBulk = typeof bulkCount === "number" && bulkCount > 1;
  const targetTitle = isBulk
    ? `${bulkCount} selected forms`
    : item?.title || "this form";
  const responseCount = isBulk ? null : item?.totalResponses || 0;

  const isConfirmed = confirmInput.trim().toUpperCase() === "DELETE";

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
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                Permanently delete {targetTitle}?
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                Irreversible. Purges all associated submissions.
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

        {/* Warning callout */}
        <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 space-y-1 font-mono">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Permanent Data Destruction
          </p>
          <p className="text-[11px] leading-relaxed">
            The form definition and all associated response records
            {!isBulk && responseCount !== null ? ` (${responseCount} submissions)` : ""}{" "}
            will be permanently purged from the database.
          </p>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-1.5 text-xs font-mono">
          <label
            htmlFor="delete-confirm-input"
            className="font-medium text-neutral-700 dark:text-neutral-300 block"
          >
            Please type <strong className="text-rose-600 font-bold">DELETE</strong> to confirm:
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="DELETE"
            disabled={isSubmitting}
            autoFocus
            className="w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-50 dark:bg-[#181B20] text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
          />
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
            id="confirm-permanent-delete-btn"
            type="button"
            onClick={() => onConfirm(confirmInput)}
            disabled={!isConfirmed || isSubmitting}
            className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium gap-1.5 h-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3" />
                <span>Purge Permanently</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
