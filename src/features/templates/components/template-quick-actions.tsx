"use client";

import React from "react";
import { Plus, Sparkles, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateQuickActionsProps {
  onBlankForm: () => void;
  isCreatingBlank: boolean;
}

export function TemplateQuickActions({
  onBlankForm,
  isCreatingBlank,
}: TemplateQuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
      {/* 1. Blank Form (Active) */}
      <button
        type="button"
        onClick={onBlankForm}
        disabled={isCreatingBlank}
        className={cn(
          "group relative flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all duration-200",
          "bg-white dark:bg-slate-900 border border-violet-200/80 dark:border-violet-900/40",
          "hover:border-[#563BFA] dark:hover:border-violet-500 hover:shadow-md hover:shadow-violet-500/5",
          "focus:outline-hidden focus:ring-2 focus:ring-[#563BFA] focus:ring-offset-2",
          isCreatingBlank && "opacity-70 cursor-wait"
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center text-[#563BFA] dark:text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
          {isCreatingBlank ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Blank Form
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            Start from scratch
          </p>
        </div>
      </button>

      {/* 2. Import with AI (Deferred / Coming Soon) */}
      <div
        className={cn(
          "relative flex items-center gap-3.5 p-3.5 rounded-2xl text-left select-none cursor-not-allowed",
          "bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 opacity-80"
        )}
        title="AI import is coming in a future update"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Import with AI
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-medium">
              Soon
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
            Paste Formly format or prompt
          </p>
        </div>
      </div>

      {/* 3. Upload File (Deferred / Coming Soon) */}
      <div
        className={cn(
          "relative flex items-center gap-3.5 p-3.5 rounded-2xl text-left select-none cursor-not-allowed sm:col-span-2 lg:col-span-1",
          "bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 opacity-80"
        )}
        title="File upload is coming in a future update"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
          <Upload className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Upload File
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-medium">
              Soon
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
            Import .formly or schema file
          </p>
        </div>
      </div>
    </div>
  );
}
