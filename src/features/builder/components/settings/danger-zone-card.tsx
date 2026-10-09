"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DangerZoneCardProps {
  formId: string;
  formTitle: string;
}

export function DangerZoneCard({ formId, formTitle }: DangerZoneCardProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to move form to Trash");
      }

      // Successfully trashed -> redirect to My Forms
      router.push("/my-forms");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200/80 dark:border-rose-950/60 p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Danger Zone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Irreversible actions for this form.
            </p>
          </div>
        </div>

        {/* Delete action button & notice */}
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            className="w-full h-9 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-50/60 dark:hover:bg-rose-950/40 active:scale-98 transition-all"
          >
            Delete Form
          </button>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            This will move the form to Trash where it can be restored or permanently deleted.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Move form to Trash?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete &ldquo;{formTitle}&rdquo;?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Moving this form to Trash will disable public responses immediately. It will be kept in your Trash for 30 days before permanent deletion, during which you can restore it at any time.
            </p>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Moving to Trash...</span>
                  </>
                ) : (
                  <span>Move to Trash</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
