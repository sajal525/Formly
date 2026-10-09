import React from "react";

export function MyFormsSkeleton({ viewMode = "list" }: { viewMode?: "list" | "grid" }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-full h-3 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between">
              <div className="w-20 h-3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 dark:border-white/5 flex gap-4">
        <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="w-1/4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-sm">
                <div className="w-2/3 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-1/2 h-3 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="w-20 h-5 rounded-full bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="w-24 h-4 rounded bg-slate-100 dark:bg-slate-800/60 hidden md:block" />
            <div className="w-16 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
