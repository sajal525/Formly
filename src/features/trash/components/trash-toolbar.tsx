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
                "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-1.5 border",
                isActive
                  ? "bg-[#563BFA] text-white border-[#563BFA]"
                  : "bg-white dark:bg-[#121417] border-[#E5E7EB] dark:border-[#27272A] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-[#181B20]"
              )}
            >
              <span>{cat.label}</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-neutral-100 dark:bg-[#181B20] text-neutral-500 dark:text-neutral-400 border border-[#E5E7EB] dark:border-[#27272A]"
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
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onBlur={() => onSearchChange(localSearch)}
            onKeyDown={handleKeyDown}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[#563BFA] transition-colors"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181B20] transition-colors whitespace-nowrap"
          >
            <span className="text-neutral-400">Sort:</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {SORT_LABELS[currentSort]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
          </button>

          {sortOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSortOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#121417] rounded-lg shadow-lg border border-[#E5E7EB] dark:border-[#27272A] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                        "w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between transition-colors",
                        isSelected
                          ? "bg-[#563BFA]/10 text-[#563BFA] dark:text-[#a594fd] font-semibold"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181B20]"
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
