"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FormDraftDTO } from "@/features/builder/server/get-form-draft";
import { RespondentFormCanvas } from "@/features/builder/components/preview/respondent-form-canvas";
import { PreviewDisplayOptions } from "@/features/builder/components/preview/preview-options-types";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StandalonePreviewShellProps {
  draft: FormDraftDTO;
}

export function StandalonePreviewShell({ draft }: StandalonePreviewShellProps) {
  const [displayOptions] = useState<PreviewDisplayOptions>({
    showProgressIndicator: draft.definition.settings?.showProgressIndicator ?? true,
    showQuestionNumbers: draft.definition.settings?.showQuestionNumbers ?? true,
    showRequiredIndicator: true,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Top Floating Preview Mode Header Banner */}
      <header className="sticky top-0 z-50 h-13 bg-slate-900 text-white px-4 sm:px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href={`/forms/${draft.id}/edit?tab=preview`}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </Link>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-300">
            <Eye className="w-3.5 h-3.5 text-violet-400" />
            <span>
              Previewing: <strong className="text-white">{draft.title}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-600/80 text-violet-100 tracking-wide">
            Respondent Preview
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            Submissions will not be recorded
          </span>
        </div>
      </header>

      {/* Main Single-Page Respondent Form Body */}
      <main className="flex-1 w-full flex justify-center py-6 sm:py-10 px-3 sm:px-6">
        <div className="w-full max-w-3xl">
          <RespondentFormCanvas
            definition={draft.definition}
            displayOptions={displayOptions}
            isStandalone={true}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>Formly Form Builder Preview — Ephemeral Testing Mode</span>
        </div>
      </footer>
    </div>
  );
}
