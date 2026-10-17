"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteAccountDialog } from "./delete-account-dialog";

export function DangerZoneCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-[#121417] rounded-xl border border-rose-300 dark:border-rose-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-rose-900 dark:text-rose-300">
                Danger Zone
              </h2>
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                Permanently delete your account and all forms.
              </p>
            </div>
          </div>

          <button
            id="open-delete-dialog-btn"
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-medium transition-colors cursor-pointer self-start sm:self-auto shrink-0"
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
