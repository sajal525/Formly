"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TemplateCategoryKey,
  TemplateSortKey,
  categoryLabels,
  sortLabels,
  templateCategoryKeys,
  templateSortKeys,
} from "../schemas/template-query-schema";

interface TemplateFiltersProps {
  currentCategory: TemplateCategoryKey;
  searchQuery: string;
  currentSort: TemplateSortKey;
  categoryCounts: Record<string, number>;
  onCategoryChange: (category: TemplateCategoryKey) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: TemplateSortKey) => void;
}

export function TemplateFilters({
  currentCategory,
  searchQuery,
  currentSort,
  categoryCounts,
  onCategoryChange,
  onSearchChange,
  onSortChange,
}: TemplateFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Sync external search query
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Keep a stable ref to onSearchChange to avoid retriggering debounced search on parent re-renders
  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChangeRef.current(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery]);

  // Close sort menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
      {/* Category chips (horizontally scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent -mx-1 px-1">
        {templateCategoryKeys.map((catKey) => {
          const isSelected = currentCategory === catKey;
          const label = categoryLabels[catKey];
          const count = categoryCounts[catKey];
          const countBadge = count !== undefined ? ` (${count})` : "";

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onCategoryChange(catKey)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 select-none",
                isSelected
                  ? "bg-[#563BFA] text-white shadow-xs font-bold"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>{label}</span>
              {catKey === "all" && countBadge && (
                <span className={cn(isSelected ? "text-violet-200" : "text-slate-400")}>
                  {countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right controls: Search input & Sort dropdown */}
      <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-64 lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9.5 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#563BFA] focus:ring-2 focus:ring-[#563BFA]/15 transition-all shadow-2xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Menu */}
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs shrink-0"
            aria-expanded={isSortOpen}
            aria-haspopup="true"
          >
            <span className="text-slate-400">Sort:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {sortLabels[currentSort]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {templateSortKeys.map((sortKey) => (
                <button
                  key={sortKey}
                  type="button"
                  onClick={() => {
                    onSortChange(sortKey);
                    setIsSortOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className={cn(currentSort === sortKey && "font-bold text-[#563BFA] dark:text-violet-400")}>
                    {sortLabels[sortKey]}
                  </span>
                  {currentSort === sortKey && (
                    <Check className="w-3.5 h-3.5 text-[#563BFA] dark:text-violet-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
