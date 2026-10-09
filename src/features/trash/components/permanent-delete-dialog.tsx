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
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Permanently delete {targetTitle}?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                This action is irreversible and cannot be undone.
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

        {/* Warning callout */}
        <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Permanent Data Destruction
          </p>
          <p className="text-[11px] leading-relaxed">
            The form definition, questions, and all associated response records
            {!isBulk && responseCount !== null ? ` (${responseCount} submissions)` : ""}{" "}
            will be permanently purged from Formly's primary database.
          </p>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-1.5 text-xs">
          <label
            htmlFor="delete-confirm-input"
            className="font-medium text-slate-700 dark:text-slate-300 block"
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
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
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
            id="confirm-permanent-delete-btn"
            type="button"
            onClick={() => onConfirm(confirmInput)}
            disabled={!isConfirmed || isSubmitting}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
