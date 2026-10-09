"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  Check,
  FileEdit,
  CheckCircle2,
  Lock,
  Archive,
  Layers,
} from "lucide-react";
import {
  FormStatusFilter,
  FormSortField,
  FormSortDirection,
  FormViewMode,
} from "../schemas/my-forms-query-schema";
import { StatusCountsDTO } from "../server/get-my-forms-page";

interface MyFormsToolbarProps {
  statusFilter: FormStatusFilter;
  statusCounts: StatusCountsDTO;
  searchQuery: string;
  sortField: FormSortField;
  sortDirection: FormSortDirection;
  viewMode: FormViewMode;
  onStatusChange: (status: FormStatusFilter) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (field: FormSortField, direction: FormSortDirection) => void;
  onViewModeChange: (view: FormViewMode) => void;
}

export function MyFormsToolbar({
  statusFilter,
  statusCounts,
  searchQuery,
  sortField,
  sortDirection,
  viewMode,
  onStatusChange,
  onSearchChange,
  onSortChange,
  onViewModeChange,
}: MyFormsToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Sync internal search if prop changes externally (e.g. browser back/forward)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search trigger (300ms)
  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

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
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs: Array<{
    id: FormStatusFilter;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: "all",
      label: "All",
      count: statusCounts.all,
      icon: Layers,
    },
    {
      id: "draft",
      label: "Drafts",
      count: statusCounts.draft,
      icon: FileEdit,
    },
    {
      id: "published",
      label: "Published",
      count: statusCounts.published,
      icon: CheckCircle2,
    },
    {
      id: "closed",
      label: "Closed",
      count: statusCounts.closed,
      icon: Lock,
    },
    {
      id: "archived",
      label: "Archived",
      count: statusCounts.archived,
      icon: Archive,
    },
  ];

  const sortOptions: Array<{
    field: FormSortField;
    direction: FormSortDirection;
    label: string;
  }> = [
    { field: "updatedAt", direction: "desc", label: "Last updated" },
    { field: "createdAt", direction: "desc", label: "Created date" },
    { field: "title", direction: "asc", label: "Name (A–Z)" },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.field === sortField)?.label || "Last updated";

  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 py-2">
      {/* 1. Status Filter Tabs */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 xl:pb-0 scroll-smooth"
        role="tablist"
        aria-label="Filter forms by status"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl text-xs font-semibold shrink-0 flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-[#563BFA] text-white shadow-sm shadow-indigo-500/20 font-bold"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive
                    ? "text-white"
                    : tab.id === "published"
                    ? "text-emerald-500"
                    : tab.id === "closed"
                    ? "text-rose-500"
                    : tab.id === "archived"
                    ? "text-amber-500"
                    : "text-slate-400"
                }`}
              />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2, 3, 4. Search, Sort, View Controls */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0">
        {/* Search input */}
        <div className="relative flex-1 sm:w-64 sm:flex-initial">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search forms..."
            maxLength={100}
            className="w-full h-9 sm:h-10 pl-9 pr-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#563BFA] focus:border-transparent transition-all shadow-2xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Menu */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="h-9 sm:h-10 px-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-all shadow-2xs"
            aria-haspopup="true"
            aria-expanded={isSortOpen}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentSortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              {sortOptions.map((opt) => {
                const isSelected =
                  sortField === opt.field && sortDirection === opt.direction;
                return (
                  <button
                    key={`${opt.field}-${opt.direction}`}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.field, opt.direction);
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#563BFA]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View Toggle (List / Grid) */}
        <div
          className="h-9 sm:h-10 p-1 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center gap-1 shadow-2xs shrink-0"
          role="radiogroup"
          aria-label="Select view mode"
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "list"
                ? "bg-[#563BFA] text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
            title="List view"
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid"
                ? "bg-[#563BFA] text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>
    </div>
  );
}
