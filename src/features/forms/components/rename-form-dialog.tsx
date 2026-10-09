"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Edit3 } from "lucide-react";

interface RenameFormDialogProps {
  isOpen: boolean;
  form: { id: string; title: string } | null;
  onClose: () => void;
  onSuccess: (updatedTitle: string) => void;
}

export function RenameFormDialog({
  isOpen,
  form,
  onClose,
  onSuccess,
}: RenameFormDialogProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setError(null);
    }
  }, [form]);

  if (!isOpen || !form) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title cannot be empty");
      return;
    }
    if (trimmed.length > 120) {
      setError("Title cannot exceed 120 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/forms/${form?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename",
          title: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to rename form");
      }

      onSuccess(trimmed);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-form-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF0FF] dark:bg-indigo-950/60 flex items-center justify-center text-[#563BFA]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="rename-form-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Rename form
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update the display name of this form.
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

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="rename-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Form Title
            </label>
            <input
              id="rename-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA] focus:border-transparent transition-all"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
              <span>Required</span>
              <span>{title.length}/120</span>
            </div>
          </div>

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
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="h-10 px-5 rounded-xl bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
