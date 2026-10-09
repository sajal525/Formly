"use client";

import React from "react";
import { FilePlus, SearchX, Inbox, RotateCcw } from "lucide-react";
import { FormStatusFilter } from "../schemas/my-forms-query-schema";

interface FormsEmptyStateProps {
  totalFormsCount: number; // all non-trashed forms
  statusFilter: FormStatusFilter;
  searchQuery: string;
  onCreateClick: () => void;
  onResetFilters: () => void;
}

export function FormsEmptyState({
  totalFormsCount,
  statusFilter,
  searchQuery,
  onCreateClick,
  onResetFilters,
}: FormsEmptyStateProps) {
  // Scenario 1: User has 0 forms in total
  if (totalFormsCount === 0) {
    return (
      <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="w-14 h-14 rounded-3xl bg-[#EEF0FF] dark:bg-indigo-950/60 flex items-center justify-center text-[#563BFA] dark:text-indigo-400 mb-4 shadow-sm">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          No forms yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          You haven&apos;t created any forms yet. Start by creating a blank draft
          form to begin collecting responses.
        </p>
        <button
          type="button"
          onClick={onCreateClick}
          className="h-10 px-5 rounded-xl bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create your first form</span>
        </button>
      </div>
    );
  }

  // Scenario 2: Search has no results
  if (searchQuery.trim().length > 0) {
    return (
      <div className="py-14 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          No results found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
          No forms matched your search for &quot;
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {searchQuery}
          </span>
          &quot;
          {statusFilter !== "all" && (
            <span> in {statusFilter} forms</span>
          )}
          .
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset search & filters</span>
        </button>
      </div>
    );
  }

  // Scenario 3: Empty specific status filter tab (Drafts, Published, Closed, Archived)
  const statusLabel =
    {
      draft: "draft",
      published: "published",
      closed: "closed",
      archived: "archived",
      all: "matching",
    }[statusFilter] || statusFilter;

  return (
    <div className="py-14 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
        No {statusLabel} forms yet
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        You do not have any forms currently marked as {statusLabel}.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
      >
        <span>View all forms</span>
      </button>
    </div>
  );
}
