import React from "react";
import { Wand2, Zap, BarChart3 } from "lucide-react";
import { HeroIllustration } from "./hero-illustration";

export function LoginHero() {
  return (
    <section className="flex flex-col justify-center h-full space-y-6 lg:space-y-8">
      {/* Top Badge & Headline & Description */}
      <div className="space-y-3 sm:space-y-4">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-100/80 dark:border-indigo-800/40 shadow-sm">
          <span className="text-xs sm:text-sm" aria-hidden="true">🚀</span>
          <span className="text-[11px] sm:text-xs font-semibold text-[#563BFA] dark:text-indigo-300 tracking-wide">
            Build Forms, Your Way
          </span>
        </div>

        {/* Headline with Gradient */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] 2xl:text-[60px] font-extrabold tracking-tight leading-[1.08] text-[var(--ink)]">
          Create. Share.{" "}
          <span className="block mt-0.5 bg-gradient-to-r from-[#329CF5] via-[#563BFA] to-[#BD45E8] bg-clip-text text-transparent">
            Collect.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm lg:text-sm xl:text-base max-w-xl leading-relaxed">
          Formly helps you create beautiful forms with powerful features, unique themes, and an easy
          AI-powered format. Perfect for students, teachers, teams and everyone.
        </p>
      </div>

      {/* Main Mid Section: Benefits & Illustration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center">
        {/* 3 Benefit Rows (~5 cols) */}
        <div className="md:col-span-5 space-y-3.5">
          {/* Benefit 1 */}
          <div className="flex items-start gap-3 group">
            <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-purple-100/80 dark:bg-purple-950/50 flex items-center justify-center text-[#563BFA] dark:text-purple-300 shadow-sm shrink-0 transition-transform group-hover:scale-105">
              <Wand2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)]">Beautiful Themes</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Make your forms look amazing
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-start gap-3 group">
            <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-blue-100/80 dark:bg-blue-950/50 flex items-center justify-center text-[#329CF5] dark:text-blue-300 shadow-sm shrink-0 transition-transform group-hover:scale-105">
              <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)]">Fast & Easy</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Smart filling with Enter → Next
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-start gap-3 group">
            <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/50 flex items-center justify-center text-[#563BFA] dark:text-indigo-300 shadow-sm shrink-0 transition-transform group-hover:scale-105">
              <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)]">Powerful Insights</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Collect and analyze responses
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Visual Illustration (~7 cols) */}
        <div className="hidden sm:flex md:col-span-7 justify-center lg:justify-end">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
