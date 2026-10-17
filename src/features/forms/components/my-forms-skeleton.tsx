import React from "react";

export function MyFormsSkeleton({ viewMode = "list" }: { viewMode?: "list" | "grid" }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] overflow-hidden"
          >
            {/* Cover Skeleton */}
            <div className="h-32 bg-neutral-200/70 dark:bg-[#1C1F26]" />
            <div className="p-4 space-y-3">
              <div className="w-3/4 h-4 rounded bg-neutral-200 dark:bg-[#27272A]" />
              <div className="w-1/2 h-3 rounded bg-neutral-100 dark:bg-[#1C1F26]" />
              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#27272A] flex justify-between items-center">
                <div className="w-20 h-3 rounded bg-neutral-200 dark:bg-[#27272A]" />
                <div className="w-14 h-3 rounded bg-neutral-200 dark:bg-[#27272A]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A] overflow-hidden animate-pulse">
      <div className="p-3 border-b border-[#E5E7EB] dark:border-[#27272A] flex gap-4">
        <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-[#27272A]" />
        <div className="w-1/4 h-3 rounded bg-neutral-200 dark:bg-[#27272A]" />
      </div>
      <div className="divide-y divide-[#E5E7EB] dark:divide-[#27272A]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-[#27272A] shrink-0" />
              <div className="w-10 h-7 rounded bg-neutral-200 dark:bg-[#27272A] shrink-0" />
              <div className="space-y-1.5 flex-1 max-w-sm">
                <div className="w-2/3 h-3.5 rounded bg-neutral-200 dark:bg-[#27272A]" />
                <div className="w-1/3 h-2.5 rounded bg-neutral-100 dark:bg-[#1C1F26]" />
              </div>
            </div>
            <div className="w-16 h-4 rounded bg-neutral-200 dark:bg-[#27272A] hidden sm:block" />
            <div className="w-20 h-3 rounded bg-neutral-100 dark:bg-[#1C1F26] hidden md:block" />
            <div className="w-14 h-6 rounded bg-neutral-200 dark:bg-[#27272A]" />
          </div>
        ))}
      </div>
    </div>
  );
}
