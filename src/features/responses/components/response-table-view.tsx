"use client";

import React, { useState } from "react";
import {
  ResponseTableColumnDTO,
  ResponseTableRowDTO,
  ResponseDetailsDTO,
} from "../server/get-responses-workspace";
import { ResponseSort, ResponsePageSize } from "../schemas/response-query-schema";
import { ResponseDetailsPanel } from "./response-details-panel";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ResponseTableViewProps {
  formId: string;
  columns: ResponseTableColumnDTO[];
  responses: ResponseTableRowDTO[];
  selectedResponse: ResponseDetailsDTO | null;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  searchQuery: string;
  sort: ResponseSort;
  pageSize: ResponsePageSize;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: ResponseSort) => void;
  onPageSizeChange: (size: ResponsePageSize) => void;
  onPageChange: (page: number) => void;
  onSelectResponse: (responseId: string | null) => void;
  onExportSelected: (selectedIds: string[]) => void;
}

export function ResponseTableView({
  formId,
  columns,
  responses,
  selectedResponse,
  pagination,
  searchQuery,
  sort,
  pageSize,
  onSearchChange,
  onSortChange,
  onPageSizeChange,
  onPageChange,
  onSelectResponse,
  onExportSelected,
}: ResponseTableViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allPageIds = responses.map((r) => r.id);
  const isAllSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allPageIds);
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const formatTimestamp = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalCount
  );

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search responses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs font-mono rounded-lg border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Selected actions, Sort, Page size */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedIds.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExportSelected(selectedIds)}
              className="h-8 text-xs font-mono gap-1.5 rounded-lg border-[#E5E7EB] dark:border-[#27272A] bg-neutral-100 dark:bg-[#1C1F26] text-neutral-700 dark:text-neutral-300"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Selected ({selectedIds.length})
            </Button>
          )}

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-mono gap-1.5 rounded-lg border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-700 dark:text-neutral-300"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                <span>Sort: {sort === "newest" ? "Latest" : "Oldest"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs font-mono border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]">
              <DropdownMenuItem onClick={() => onSortChange("newest")}>
                Latest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("oldest")}>
                Oldest first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Page Size Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-mono gap-1 rounded-lg border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-700 dark:text-neutral-300"
              >
                <span>{pageSize} / page</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs font-mono border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417]">
              <DropdownMenuItem onClick={() => onPageSizeChange(10)}>
                10 per page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPageSizeChange(20)}>
                20 per page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPageSizeChange(50)}>
                50 per page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table + Detail Panel Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Table Container */}
        <div
          className={cn(
            "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl overflow-hidden transition-all",
            selectedResponse ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"
          )}
        >
          {responses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {searchQuery
                  ? "No submissions match your search query."
                  : "No responses yet."}
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching for a different term or clearing the search filter."
                  : "Once this form receives submissions, they will be listed here."}
              </p>
              {searchQuery && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSearchChange("")}
                  className="mt-3 text-xs h-7 rounded-lg border-[#E5E7EB] dark:border-[#27272A]"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#181B20] border-b border-[#E5E7EB] dark:border-[#27272A] text-neutral-400 dark:text-neutral-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all responses on this page"
                        className="rounded border-[#E5E7EB] dark:border-[#27272A] text-[#563BFA] focus:ring-[#563BFA] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-2 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Timestamp</th>
                    {columns.map((col) => (
                      <th
                        key={col.id}
                        className="py-2.5 px-3 min-w-[120px] max-w-[180px] truncate"
                        title={col.label}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#27272A]">
                  {responses.map((row) => {
                    const isSelected = selectedResponse?.id === row.id;
                    const isChecked = selectedIds.includes(row.id);

                    return (
                      <tr
                        key={row.id}
                        onClick={() => onSelectResponse(row.id)}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-[#1C1F26]",
                          isSelected
                            ? "bg-[#563BFA]/5 dark:bg-[#563BFA]/10 font-medium"
                            : ""
                        )}
                      >
                        <td
                          className="p-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => toggleSelectRow(row.id, e as any)}
                            aria-label={`Select response ${row.rowNumber}`}
                            className="rounded border-[#E5E7EB] dark:border-[#27272A] text-[#563BFA] focus:ring-[#563BFA] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center text-neutral-400 font-mono text-[11px]">
                          {row.rowNumber}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 font-mono text-xs whitespace-nowrap">
                          {formatTimestamp(row.submittedAt)}
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.id}
                            className="py-2.5 px-3 text-neutral-800 dark:text-neutral-200 max-w-[180px] truncate"
                            title={row.previewAnswers[col.id]}
                          >
                            {row.previewAnswers[col.id] || "-"}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right pr-4">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectResponse(row.id);
                            }}
                            className={cn(
                              "h-6 px-2 text-xs rounded-md gap-1 font-mono transition-colors border",
                              isSelected
                                ? "bg-[#563BFA] text-white border-[#563BFA]"
                                : "border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1C1F26]"
                            )}
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination Footer */}
          {pagination.totalCount > 0 && (
            <div className="p-3 bg-white dark:bg-[#121417] border-t border-[#E5E7EB] dark:border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-500">
              <div>
                Showing <span className="font-bold text-neutral-800 dark:text-neutral-200">{startRecord}</span> to{" "}
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{endRecord}</span> of{" "}
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{pagination.totalCount}</span> responses
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => onPageChange(pagination.page - 1)}
                    className="h-7 w-7 p-0 rounded-md border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-600 dark:text-neutral-400"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (pagination.totalPages <= 5) return true;
                      return (
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - pagination.page) <= 1
                      );
                    })
                    .map((p, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const hasGap = prevPage && p - prevPage > 1;

                      return (
                        <React.Fragment key={p}>
                          {hasGap && <span className="px-1 text-neutral-400 font-mono text-xs">...</span>}
                          <Button
                            variant={p === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(p)}
                            className={cn(
                              "h-7 w-7 p-0 rounded-md text-xs font-mono font-medium transition-colors border",
                              p === pagination.page
                                ? "bg-[#563BFA] text-white border-[#563BFA]"
                                : "border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1C1F26]"
                            )}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                      );
                    })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => onPageChange(pagination.page + 1)}
                    className="h-7 w-7 p-0 rounded-md border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-600 dark:text-neutral-400"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Detail Panel when a response is selected */}
        {selectedResponse && (
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
            <ResponseDetailsPanel
              selectedResponse={selectedResponse}
              onClose={() => onSelectResponse(null)}
              onNavigate={(id) => onSelectResponse(id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
