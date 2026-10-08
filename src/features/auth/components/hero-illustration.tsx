import React from "react";
import { cn } from "@/lib/utils";

interface HeroIllustrationProps {
  className?: string;
}

export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-full max-w-[440px] h-[250px] sm:h-[280px] lg:h-[300px] xl:h-[330px] flex items-center justify-center select-none pointer-events-none",
        className
      )}
    >
      {/* Soft Ambient Background Glows */}
      <div className="absolute -top-8 -left-6 w-52 h-52 bg-pink-200/50 dark:bg-pink-900/20 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-0 w-60 h-60 bg-cyan-200/40 dark:bg-cyan-900/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-6 left-10 w-52 h-52 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl" />

      {/* Decorative Doodles & Sparkles */}
      <svg
        className="absolute -top-1 left-8 w-6 h-6 text-indigo-400/60 dark:text-indigo-400/40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute top-12 -left-2 w-5 h-5 text-purple-400/70"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M7 17l9-9m0 0H9m7 0v7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg
        className="absolute top-1/2 -right-3 w-6 h-6 text-pink-400/60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
      </svg>

      {/* MAIN FORM TABLET / CARD (Tilted) */}
      <div className="relative z-10 w-[210px] sm:w-[230px] lg:w-[245px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_40px_-10px_rgba(86,59,250,0.18)] border border-slate-100 dark:border-white/10 transform -rotate-3 transition-transform duration-500 hover:rotate-0">
        {/* Tablet Top Bar */}
        <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
          <div className="w-4 h-4 rounded-md bg-[#563BFA] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
              <path d="M12 2C12.5 7 17 11.5 22 12C17 12.5 12.5 17 12 22C11.5 17 7 12.5 2 12C7 11.5 11.5 7 12 2Z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Formly</span>
        </div>

        {/* Question Header Skeleton */}
        <div className="space-y-1.5 mb-3">
          <div className="w-3/4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="w-1/2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Form Input Skeletons */}
        <div className="space-y-2 mb-3.5">
          <div className="w-full h-6.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-white/5 flex items-center px-2">
            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600 mr-2 shrink-0" />
            <div className="w-2/3 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full" />
          </div>
          <div className="w-full h-6.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-white/5 flex items-center px-2">
            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600 mr-2 shrink-0" />
            <div className="w-1/2 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full" />
          </div>
          <div className="w-full h-6.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-white/5 flex items-center px-2">
            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600 mr-2 shrink-0" />
            <div className="w-3/5 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full" />
          </div>
        </div>

        {/* Primary Action Button Bar */}
        <div className="w-full h-6.5 rounded-lg bg-gradient-to-r from-[#329CF5] to-[#563BFA] flex items-center justify-center shadow-md shadow-[#563BFA]/20">
          <div className="w-14 h-1.5 bg-white/90 rounded-full" />
        </div>
      </div>

      {/* FLOATING "CHOOSE A THEME" TILE */}
      <div className="absolute top-1 right-2 lg:right-4 z-20 w-[130px] lg:w-[145px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-100 dark:border-white/10 transform rotate-6">
        <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          Choose a Theme
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-7 rounded bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/40 shadow-sm" />
          <div className="h-7 rounded bg-gradient-to-br from-pink-400 to-rose-500 border border-white/40 shadow-sm" />
          <div className="h-7 rounded bg-gradient-to-br from-cyan-400 to-blue-500 border border-white/40 shadow-sm" />
          <div className="h-7 rounded bg-gradient-to-br from-amber-300 to-orange-400 border border-white/40 shadow-sm" />
          <div className="h-7 rounded bg-gradient-to-br from-emerald-400 to-teal-500 border border-white/40 shadow-sm" />
          <div className="h-7 rounded bg-gradient-to-br from-slate-700 to-slate-900 border border-white/40 shadow-sm" />
        </div>
      </div>

      {/* FLOATING "60% COMPLETE" PILL */}
      <div className="absolute left-0 lg:-left-2 top-1/2 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg p-2 shadow-lg border border-slate-100 dark:border-white/10 transform -rotate-6">
        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-700 dark:text-slate-200 mb-1 gap-2">
          <span>60% complete</span>
          <span className="text-indigo-500 font-bold">✨</span>
        </div>
        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="w-3/5 h-full bg-gradient-to-r from-[#329CF5] to-[#563BFA] rounded-full" />
        </div>
      </div>

      {/* FLOATING USER PROFILE PILL */}
      <div className="absolute right-1 top-2/3 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg p-1.5 shadow-lg border border-slate-100 dark:border-white/10 flex items-center gap-1.5 transform rotate-3">
        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[9px] font-bold">
          S
        </div>
        <div className="space-y-0.5 pr-1">
          <div className="w-8 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          <div className="w-5 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* FLOATING ANALYTICS BAR CHART TILE */}
      <div className="absolute -bottom-1 right-5 lg:right-8 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl p-2 shadow-xl border border-slate-100 dark:border-white/10 transform rotate-1">
        <div className="flex items-end gap-1 h-9 w-16 px-0.5 pt-0.5 justify-between">
          <div className="w-2.5 h-4 bg-[#329CF5] rounded-t-sm" />
          <div className="w-2.5 h-6 bg-[#4F68FA] rounded-t-sm" />
          <div className="w-2.5 h-8 bg-[#563BFA] rounded-t-sm" />
          <div className="w-2.5 h-5 bg-[#BD45E8] rounded-t-sm" />
        </div>
      </div>
    </div>
  );
}
