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
  const sortRef = useRef<HTMLDivElement>(null);

  // Sync internal search if prop changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search trigger (250ms)
  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChangeRef.current(localSearch);
      }
    }, 250);
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
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 py-1.5">
      {/* 1. Status Filter Tabs (Monochrome, Crisp 1px Borders) */}
      <div
        className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar py-0.5"
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
              aria-label={`${tab.label} forms (${tab.count})`}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 transition-all outline-none select-none border cursor-pointer",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-2xs"
                  : "bg-white dark:bg-zinc-900/70 border-zinc-200/90 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded text-[10px] font-mono leading-none",
                  isActive
                    ? "bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-950"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Right-side Controls: Search, Sort, Grid/List */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-56 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search forms..."
            maxLength={100}
            className="w-full h-8 pl-8.5 pr-7 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all shadow-2xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort Menu */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="h-8 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            aria-haspopup="true"
            aria-expanded={isSortOpen}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span>{currentSortLabel}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200/90 dark:border-zinc-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
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
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-purple-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View Toggle (Grid / List) */}
        <div
          className="h-8 p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-center gap-0.5 shadow-2xs shrink-0"
          role="radiogroup"
          aria-label="Select view mode"
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )}
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
            className={cn(
              "h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
              viewMode === "list"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-2xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )}
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
