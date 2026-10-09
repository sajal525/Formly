"use client";

import React from "react";
import { FileText, Sparkles, LayoutGrid, UploadCloud, ArrowRight } from "lucide-react";

interface QuickStartCardsProps {
  onBlankFormClick: () => void;
}

export function QuickStartCards({ onBlankFormClick }: QuickStartCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* 1. Blank Form (ACTIVE) */}
      <button
        type="button"
        onClick={onBlankFormClick}
        className="group text-left p-4 lg:p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 hover:border-[#563BFA]/40 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between h-[126px] sm:h-[132px] lg:h-[138px] overflow-hidden cursor-pointer"
      >
        <div className="flex items-start justify-between w-full">
          <div className="w-9 h-9 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-[#563BFA] dark:text-violet-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40">
            Active
          </span>
        </div>

        <div className="flex items-end justify-between w-full mt-2">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#563BFA] dark:group-hover:text-indigo-400 transition-colors">
              Blank Form
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Start from scratch
            </p>
          </div>
          <div className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-[#563BFA] group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-0.5">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      {/* 2. Import with AI */}
      <div
        className="p-4 lg:p-4.5 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 opacity-80 flex flex-col justify-between h-[126px] sm:h-[132px] lg:h-[138px] cursor-not-allowed select-none"
        title="Import with AI will be available in future updates"
      >
        <div className="flex items-start justify-between w-full">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold">
            Coming soon
          </span>
        </div>

        <div className="flex items-end justify-between w-full mt-2">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              Import with AI
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Paste Formly format or text
            </p>
          </div>
          <div className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Use Template */}
      <div
        className="p-4 lg:p-4.5 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 opacity-80 flex flex-col justify-between h-[126px] sm:h-[132px] lg:h-[138px] cursor-not-allowed select-none"
        title="Template Gallery will be available in the next release"
      >
        <div className="flex items-start justify-between w-full">
          <div className="w-9 h-9 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-500 flex items-center justify-center shadow-xs">
            <LayoutGrid className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold">
            Coming soon
          </span>
        </div>

        <div className="flex items-end justify-between w-full mt-2">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              Use Template
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Choose from 50+ templates
            </p>
          </div>
          <div className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 4. Upload File */}
      <div
        className="p-4 lg:p-4.5 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 opacity-80 flex flex-col justify-between h-[126px] sm:h-[132px] lg:h-[138px] cursor-not-allowed select-none"
        title="File upload import will be available in future updates"
      >
        <div className="flex items-start justify-between w-full">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold">
            Coming soon
          </span>
        </div>

        <div className="flex items-end justify-between w-full mt-2">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              Upload File
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Import .formly or .txt file
            </p>
          </div>
          <div className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
