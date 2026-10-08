import React from "react";
import { cn } from "@/lib/utils";
import { Lock, User as UserIcon, Cloud, PieChart, BarChart2 } from "lucide-react";

interface RegistrationIllustrationProps {
  className?: string;
}

export function RegistrationIllustration({ className }: RegistrationIllustrationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-full max-w-[440px] h-[260px] sm:h-[280px] lg:h-[300px] xl:h-[330px] flex items-center justify-center select-none pointer-events-none",
        className
      )}
    >
      {/* Soft Ambient Background Glows */}
      <div className="absolute -top-6 -left-6 w-52 h-52 bg-pink-200/50 dark:bg-pink-900/20 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-0 w-60 h-60 bg-cyan-200/40 dark:bg-cyan-900/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-6 left-10 w-52 h-52 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl" />

      {/* Decorative Doodles & Squiggles (matching 2.png) */}
      <svg
        className="absolute -top-1 left-12 w-6 h-6 text-indigo-400/60 dark:text-indigo-400/40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute top-1/2 right-2 w-7 h-7 text-indigo-400/70"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12c4-8 10-2 14 0" strokeLinecap="round" />
        <path d="M16 12l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* MAIN FORM TABLET / CARD (Tilted) */}
      <div className="relative z-10 w-[210px] sm:w-[230px] lg:w-[245px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_40px_-10px_rgba(86,59,250,0.18)] border border-slate-100 dark:border-white/10 transform -rotate-2 transition-transform duration-500 hover:rotate-0">
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
            <div className="w-3/5 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full" />
          </div>
          <div className="w-full h-6.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-white/5 flex items-center px-2">
            <div className="w-4/5 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full" />
          </div>
          <div className="w-full h-6.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-white/5 flex items-center px-2">
            <div className="w-1/2 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full" />
          </div>
        </div>

        {/* Primary Action Button Bar */}
        <div className="w-full h-6.5 rounded-lg bg-gradient-to-r from-[#329CF5] to-[#563BFA] flex items-center justify-center shadow-md shadow-[#563BFA]/20">
          <div className="w-14 h-1.5 bg-white/90 rounded-full" />
        </div>
      </div>

      {/* FLOATING LOCK BADGE (top-left of sheet in 2.png) */}
      <div className="absolute top-1/4 left-1 lg:left-3 z-20 w-9 h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-slate-100 dark:border-white/10 flex items-center justify-center transform -rotate-6">
        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#329CF5]">
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* FLOATING USER BADGE (top-right of sheet in 2.png) */}
      <div className="absolute top-10 right-3 lg:right-6 z-20 w-9 h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-slate-100 dark:border-white/10 flex items-center justify-center transform rotate-6">
        <div className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-pink-600">
          <UserIcon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* FLOATING BAR CHART PILL (bottom-left of sheet in 2.png) */}
      <div className="absolute bottom-6 left-0 lg:left-2 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl p-2 shadow-lg border border-slate-100 dark:border-white/10 flex items-end gap-1 h-9 w-12 transform -rotate-3">
        <div className="w-2 h-3.5 bg-[#329CF5] rounded-t-sm" />
        <div className="w-2 h-5 bg-[#563BFA] rounded-t-sm" />
        <div className="w-2 h-6 bg-[#BD45E8] rounded-t-sm" />
      </div>

      {/* FLOATING CLOUD PILL (bottom-center in 2.png) */}
      <div className="absolute -bottom-1 left-28 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl p-2 shadow-lg border border-slate-100 dark:border-white/10 flex items-center gap-1.5 transform rotate-2">
        <div className="w-5 h-5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-[#329CF5]">
          <Cloud className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* FLOATING DONUT/PIE CHART (bottom-right in 2.png) */}
      <div className="absolute -bottom-2 right-6 lg:right-8 z-20 w-9 h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl p-1.5 shadow-xl border border-slate-100 dark:border-white/10 flex items-center justify-center transform rotate-6">
        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-amber-400 border-r-cyan-400 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
