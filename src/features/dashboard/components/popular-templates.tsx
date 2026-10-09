"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid, Sparkles } from "lucide-react";

export function PopularTemplatesSection() {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Popular Templates
        </h2>
        <Link
          href="/templates"
          className="text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="p-3.5 sm:p-4 lg:p-4.5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-100 to-purple-100 dark:from-pink-950/40 dark:to-purple-950/40 text-pink-500 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Link href="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Curated Template Gallery
              </Link>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#563BFA] dark:text-indigo-400">
                Active
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Pre-built templates for student registration, course feedback, quizzes, and event surveys ready to customize in the Formly builder.
            </p>
          </div>
        </div>

        <Link
          href="/templates"
          className="flex items-center gap-2 shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Browse templates</span>
        </Link>
      </div>
    </section>
  );
}
