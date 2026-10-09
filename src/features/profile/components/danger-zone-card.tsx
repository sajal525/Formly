"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteAccountDialog } from "./delete-account-dialog";

export function DangerZoneCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-3xl border border-rose-200/80 dark:border-rose-900/40 p-6 shadow-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-rose-100/70 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-200">
                Danger Zone
              </h2>
              <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-0.5">
                Permanently delete your account and all data.
              </p>
            </div>
          </div>

          <button
            id="open-delete-dialog-btn"
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
