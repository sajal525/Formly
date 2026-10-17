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
      <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A]">
        <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center text-neutral-500 dark:text-neutral-400 mb-4">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
          No forms yet
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
          You haven&apos;t created any forms yet. Start by creating a blank draft
          form to begin collecting responses.
        </p>
        <button
          type="button"
          onClick={onCreateClick}
          className="h-8 px-4 rounded-lg bg-[#563BFA] hover:bg-[#482fe0] text-white text-xs font-medium flex items-center gap-2 transition-colors"
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
      <div className="py-14 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A]">
        <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center text-neutral-400 mb-4">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
          No results found
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-5 leading-relaxed">
          No forms matched your search for &quot;
          <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
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
          className="h-8 px-3.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-700 dark:text-neutral-200 text-xs font-medium flex items-center gap-2 transition-colors"
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
    <div className="py-14 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-[#121417] rounded-xl border border-[#E5E7EB] dark:border-[#27272A]">
      <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-[#1C1F26] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center text-neutral-400 mb-4">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
        No {statusLabel} forms yet
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-5 leading-relaxed">
        You do not have any forms currently marked as {statusLabel}.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="h-8 px-3.5 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] hover:bg-neutral-50 dark:hover:bg-[#1C1F26] text-neutral-700 dark:text-neutral-200 text-xs font-medium flex items-center gap-2 transition-colors"
      >
        <span>View all forms</span>
      </button>
    </div>
  );
}
