"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, FilePlus, Sparkles } from "lucide-react";

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (form: { id: string; title: string }) => void;
}

export function CreateFormModal({
  isOpen,
  onClose,
  onCreated,
}: CreateFormModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled form",
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create draft form");
      }

      setTitle("");
      setDescription("");
      onClose();
      if (onCreated && data.form) {
        onCreated(data.form);
      }
      if (data.form?.id) {
        router.push(`/forms/${data.form.id}/edit`);
      } else {
        router.refresh();
      }
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
      aria-labelledby="create-form-dialog-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF0FF] dark:bg-indigo-950/60 flex items-center justify-center text-[#563BFA]">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="create-form-dialog-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Create blank form
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start with a blank draft. You can edit it later.
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
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="form-title-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Form Title
            </label>
            <input
              id="form-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Student Registration, Feedback Survey"
              maxLength={120}
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA] focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to default to &quot;Untitled form&quot;.
            </p>
          </div>

          <div>
            <label
              htmlFor="form-desc-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Description <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <textarea
              id="form-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or instructions for respondents..."
              rows={2}
              maxLength={500}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA] focus:border-transparent transition-all resize-none"
            />
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
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#563BFA] to-[#7B52F8] hover:from-[#492de0] hover:to-[#6c40e5] text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
