"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import {
  TrashTypeFilter,
  TrashSort,
} from "../schemas/trash-query-schema";
import { TrashCountsDTO } from "../server/get-trash-page";
import { cn } from "@/lib/utils";

interface TrashToolbarProps {
  counts: TrashCountsDTO;
  currentType: TrashTypeFilter;
  searchQuery: string;
  currentSort: TrashSort;
  onTypeChange: (type: TrashTypeFilter) => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: TrashSort) => void;
}

const SORT_LABELS: Record<TrashSort, string> = {
  deleted_desc: "Date deleted (newest)",
  deleted_asc: "Date deleted (oldest)",
  name_asc: "Name (A–Z)",
  expiring_asc: "Expiring soonest",
};

export function TrashToolbar({
  counts,
  currentType,
  searchQuery,
  currentSort,
  onTypeChange,
  onSearchChange,
  onSortChange,
}: TrashToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(localSearch);
    }
  };

  const categories: { key: TrashTypeFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "forms", label: "Forms", count: counts.forms },
    { key: "templates", label: "Templates", count: counts.templates },
    { key: "others", label: "Others", count: counts.others },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isActive = currentType === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onTypeChange(cat.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs",
                isActive
                  ? "bg-[#563BFA] text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
              )}
            >
              <span>{cat.label}</span>
              <span
                className={cn(
                  "text-[11px] px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onBlur={() => onSearchChange(localSearch)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-2xs transition-colors"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-2xs transition-colors whitespace-nowrap"
          >
            <span className="text-slate-400">Sort by:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {SORT_LABELS[currentSort]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {sortOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSortOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                {(Object.keys(SORT_LABELS) as TrashSort[]).map((sortKey) => {
                  const isSelected = currentSort === sortKey;
                  return (
                    <button
                      key={sortKey}
                      type="button"
                      onClick={() => {
                        onSortChange(sortKey);
                        setSortOpen(false);
                      }}
                      className={cn(
                        "w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors",
                        isSelected
                          ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <span>{SORT_LABELS[sortKey]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
