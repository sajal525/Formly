"use client";

import React, { useState } from "react";
import { FormlyLogo } from "@/components/branding/formly-logo";
import {
  FileText,
  FileEdit,
  Users,
  TrendingUp,
  Plus,
  Upload,
  LayoutGrid,
  BarChart,
  ChevronRight,
  Lightbulb,
  X,
} from "lucide-react";

interface RightRailProps {
  stats: {
    totalForms: number;
    draftForms: number;
  };
  onCreateClick: () => void;
}

export function RightRail({ stats, onCreateClick }: RightRailProps) {
  const [tipDismissed, setTipDismissed] = useState(false);

  return (
    <div className="w-full xl:w-[320px] 2xl:w-[340px] shrink-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-5">
      {/* 1. Formly Intro Promo Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#ECEBFF] via-[#E4F2FE] to-[#FDE8F7] dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/30 border border-slate-200/70 dark:border-white/10 shadow-sm">
        {/* Decorative blur spheres */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-gradient-to-tr from-[#BD45E8]/30 to-[#329CF5]/30 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-[#563BFA]/20 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <FormlyLogo size="sm" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
            Create. Share. <br />
            Collect. Easily.
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Powerful forms for students, teachers, teams and everyone.
          </p>
        </div>
      </div>

      {/* 2. Your Activity Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Your Activity
          </h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            All time
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Real metric: Forms Created */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
              <FileText className="w-3.5 h-3.5 text-[#563BFA]" />
              <span>Forms</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalForms}
            </div>
            <div className="text-[10px] text-slate-400">Created so far</div>
          </div>

          {/* Real metric: Draft Forms */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
              <FileEdit className="w-3.5 h-3.5 text-[#329CF5]" />
              <span>Drafts</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {stats.draftForms}
            </div>
            <div className="text-[10px] text-slate-400">In progress</div>
          </div>

          {/* Honest unavailable metric: Responses */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1 opacity-70">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
              <Users className="w-3.5 h-3.5 text-pink-500" />
              <span>Responses</span>
            </div>
            <div className="text-xl font-extrabold text-slate-400 font-mono">
              —
            </div>
            <div className="text-[10px] text-slate-400">Coming soon</div>
          </div>

          {/* Honest unavailable metric: Completion Rate */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 space-y-1 opacity-70">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Rate</span>
            </div>
            <div className="text-xl font-extrabold text-slate-400 font-mono">
              —
            </div>
            <div className="text-[10px] text-slate-400">Coming soon</div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onCreateClick}
            className="w-full p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#563BFA] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="group-hover:text-[#563BFA] transition-colors">
                Create a new form
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div
            className="w-full p-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-400 cursor-not-allowed opacity-60"
            title="Import feature coming soon"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center">
                <Upload className="w-3.5 h-3.5" />
              </div>
              <span>Import Formly file</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              Soon
            </span>
          </div>

          <div
            className="w-full p-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-400 cursor-not-allowed opacity-60"
            title="Template catalog coming soon"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-500 flex items-center justify-center">
                <LayoutGrid className="w-3.5 h-3.5" />
              </div>
              <span>Browse templates</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              Soon
            </span>
          </div>

          <div
            className="w-full p-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-400 cursor-not-allowed opacity-60"
            title="Responses viewer coming soon"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
                <BarChart className="w-3.5 h-3.5" />
              </div>
              <span>View all responses</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              Soon
            </span>
          </div>
        </div>
      </div>

      {/* 4. Tip Card */}
      {!tipDismissed && (
        <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 relative shadow-xs">
          <button
            type="button"
            onClick={() => setTipDismissed(true)}
            className="absolute right-3 top-3 p-1 rounded-lg text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors"
            aria-label="Dismiss tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-3 pr-4">
            <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Tip
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                Start with a blank draft. You can build questions, customize styles, and share forms with respondents in upcoming updates!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
