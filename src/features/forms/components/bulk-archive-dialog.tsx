"use client";

import React from "react";
import { X, Archive, Loader2 } from "lucide-react";

interface BulkArchiveDialogProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function BulkArchiveDialog({
  isOpen,
  count,
  onClose,
  onConfirm,
  isSubmitting,
}: BulkArchiveDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-archive-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="bulk-archive-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Archive selected forms
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Move {count} form{count === 1 ? "" : "s"} to the archive.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Are you sure you want to archive the {count} selected form
          {count === 1 ? "" : "s"}? Archived forms will be removed from your
          active list, but their previous status is preserved and they can be
          restored at any time.
        </p>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : (
              <span>Archive forms</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
