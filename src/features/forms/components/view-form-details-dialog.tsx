"use client";

import React, { useState } from "react";
import { MyFormItemDTO } from "../server/get-my-forms-page";
import { formatDateTime, formatRelativeTime } from "../utils/formatters";
import {
  X,
  FileText,
  Copy,
  Check,
  Calendar,
  Clock,
  Palette,
  Info,
} from "lucide-react";

interface ViewFormDetailsDialogProps {
  isOpen: boolean;
  form: MyFormItemDTO | null;
  onClose: () => void;
}

export function ViewFormDetailsDialog({
  isOpen,
  form,
  onClose,
}: ViewFormDetailsDialogProps) {
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !form) return null;

  async function handleCopyId() {
    if (!form) return;
    try {
      await navigator.clipboard.writeText(form.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignore
    }
  }

  const statusConfig = {
    DRAFT: {
      label: "Draft",
      className:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      dot: "bg-slate-400",
    },
    PUBLISHED: {
      label: "Published",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
      dot: "bg-emerald-500",
    },
    CLOSED: {
      label: "Closed",
      className:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
      dot: "bg-rose-500",
    },
    ARCHIVED: {
      label: "Archived",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
      dot: "bg-amber-500",
    },
    TRASHED: {
      label: "Trashed",
      className:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40",
      dot: "bg-red-500",
    },
  }[form.status] || {
    label: form.status,
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-details-title"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF0FF] dark:bg-indigo-950/60 flex items-center justify-center text-[#563BFA] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="form-details-title"
                className="text-lg font-bold text-slate-900 dark:text-white leading-tight"
              >
                Form Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Metadata and configuration summary
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

        {/* Content list */}
        <div className="space-y-4 text-xs">
          {/* Title & Status */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Title
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.className}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white break-words">
              {form.title}
            </p>
            {form.description ? (
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap pt-1">
                {form.description}
              </p>
            ) : (
              <p className="text-slate-400 italic pt-1">No description provided</p>
            )}
          </div>

          {/* Form ID */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Form ID
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">
                {form.id}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-1.5 text-[11px]"
              title="Copy ID"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created Date</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {formatDateTime(form.createdAt)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Updated</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {formatRelativeTime(form.updatedAt)}{" "}
                <span className="text-slate-400 text-[11px]">
                  ({formatDateTime(form.updatedAt)})
                </span>
              </p>
            </div>
          </div>

          {/* Theme & Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <Palette className="w-3.5 h-3.5" />
                <span>Theme</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {form.themeKey ? form.themeKey : "Default Neutral"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>Responses & Views</span>
              </div>
              <p className="text-slate-500 italic">Not tracked yet</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
