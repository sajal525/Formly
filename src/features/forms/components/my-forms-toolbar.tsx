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

import { cn } from "@/lib/utils";

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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Detect touch devices for hover fallback
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    }
  }, []);

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
    inactiveColor: string;
  }> = [
    {
      id: "all",
      label: "All",
      count: statusCounts.all,
      icon: Layers,
      inactiveColor:
        "text-slate-400 dark:text-slate-500 group-hover:text-[#563BFA] dark:group-hover:text-indigo-400",
    },
    {
      id: "draft",
      label: "Drafts",
      count: statusCounts.draft,
      icon: FileEdit,
      inactiveColor:
        "text-slate-400 dark:text-slate-500 group-hover:text-amber-500 dark:group-hover:text-amber-400",
    },
    {
      id: "published",
      label: "Published",
      count: statusCounts.published,
      icon: CheckCircle2,
      inactiveColor: "text-emerald-500",
    },
    {
      id: "closed",
      label: "Closed",
      count: statusCounts.closed,
      icon: Lock,
      inactiveColor: "text-rose-500",
    },
    {
      id: "archived",
      label: "Archived",
      count: statusCounts.archived,
      icon: Archive,
      inactiveColor: "text-amber-500",
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
      {/* 1. Compact Status Filter Tabs with Smooth Expand on Hover */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-fit max-w-full overflow-x-auto sm:overflow-visible no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 py-1 sm:py-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role="tablist"
        aria-label="Filter forms by status"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;
          const isExpanded =
            hoveredTab === tab.id || (isTouchDevice && isActive);

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab.label} forms (${tab.count})`}
              title={`${tab.label} (${tab.count})`}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              onFocus={() => setHoveredTab(tab.id)}
              onBlur={() => setHoveredTab(null)}
              className={cn(
                "group relative h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl text-xs font-semibold shrink-0 flex items-center justify-center transition-all duration-300 ease-out outline-none select-none",
                "focus-visible:ring-2 focus-visible:ring-[#563BFA] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
                isActive
                  ? "bg-gradient-to-r from-[#563BFA] to-[#7B52F8] text-white shadow-md shadow-indigo-500/25 font-bold border border-transparent"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-white/20 shadow-2xs"
              )}
            >
              {/* Tooltip for desktop accessibility */}
              <div
                role="tooltip"
                className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 dark:bg-slate-800/95 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 shadow-md whitespace-nowrap z-30 hidden group-hover:md:block group-focus-visible:md:block"
              >
                {tab.label} ({tab.count})
              </div>

              {/* Intuitive Icon */}
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-white" : tab.inactiveColor
                )}
              />

              {/* Smoothly Expandable Label and Form Count */}
              <div
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out flex items-center gap-1.5",
                  isExpanded
                    ? "max-w-[160px] opacity-100 ml-2"
                    : "max-w-0 opacity-0 ml-0 group-hover:max-w-[160px] group-hover:opacity-100 group-hover:ml-2 group-focus-visible:max-w-[160px] group-focus-visible:opacity-100 group-focus-visible:ml-2"
                )}
              >
                <span className="leading-none">{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0 transition-colors",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-700/70"
                  )}
                >
                  {tab.count}
                </span>
              </div>
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

        {/* View Toggle (Grid / List) */}
        <div
          className="h-9 sm:h-10 p-1 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center gap-1 shadow-2xs shrink-0"
          role="radiogroup"
          aria-label="Select view mode"
        >
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
        </div>
      </div>
    </div>
  );
}
