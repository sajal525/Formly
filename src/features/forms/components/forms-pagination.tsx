"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { FormPageSize } from "../schemas/my-forms-query-schema";

interface FormsPaginationProps {
  totalMatching: number;
  currentPage: number;
  pageSize: FormPageSize;
  pageCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: FormPageSize) => void;
}

export function FormsPagination({
  totalMatching,
  currentPage,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
}: FormsPaginationProps) {
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsSizeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (totalMatching === 0) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalMatching);

  // Generate page numbers with smart ellipsis for larger sets
  function getPageNumbers(): (number | string)[] {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    if (currentPage > 3) {
      pages.push("...");
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(pageCount - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < pageCount - 2) {
      pages.push("...");
    }
    if (pageCount > 1) {
      pages.push(pageCount);
    }
    return pages;
  }

  const pageNumbers = getPageNumbers();
  const pageSizes: FormPageSize[] = [10, 20, 50];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-6 text-xs text-slate-500 dark:text-slate-400">
      {/* Left: Summary text */}
      <p className="font-medium text-center sm:text-left">
        Showing{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {startRecord}–{endRecord}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {totalMatching}
        </span>{" "}
        forms
      </p>

      {/* Right: Page Size Selector + Pagination Buttons */}
      <div className="flex items-center gap-4">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Rows per page:
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
              className="h-8 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-2xs"
              aria-label="Select number of rows per page"
              aria-expanded={isSizeDropdownOpen}
            >
              <span>{pageSize}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSizeDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-20 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200/80 dark:border-white/10 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                {pageSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      onPageSizeChange(size);
                      setIsSizeDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-semibold transition-colors ${
                      pageSize === size
                        ? "text-[#563BFA] dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Page navigation buttons */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered pages */}
          {pageNumbers.map((num, idx) => {
            if (typeof num === "string") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400"
                >
                  ...
                </span>
              );
            }

            const isCurrent = num === currentPage;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                aria-current={isCurrent ? "page" : undefined}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-[#563BFA] text-white shadow-xs shadow-indigo-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {num}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= pageCount}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
