"use client";

import React from "react";
import { MyFormItemDTO } from "../server/get-my-forms-page";
import { FormStatusBadge } from "./form-status-badge";
import { FormRowActions } from "./form-row-actions";
import { formatDate, formatDateTime, formatRelativeTime } from "../utils/formatters";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormsListTableProps {
  forms: MyFormItemDTO[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewDetails: (form: MyFormItemDTO) => void;
  onRename: (form: MyFormItemDTO) => void;
  onArchive: (form: MyFormItemDTO) => void;
  onRestore: (form: MyFormItemDTO) => void;
  onTrash: (form: MyFormItemDTO) => void;
}

export function FormsListTable({
  forms,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetails,
  onRename,
  onArchive,
  onRestore,
  onTrash,
}: FormsListTableProps) {
  const isAllSelected =
    forms.length > 0 && forms.every((f) => selectedIds.has(f.id));
  const isSomeSelected =
    forms.some((f) => selectedIds.has(f.id)) && !isAllSelected;

  return (
    <div className="w-full bg-white dark:bg-zinc-900/80 rounded-xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {/* Checkbox */}
              <th scope="col" className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Select all forms on this page"
                  className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                />
              </th>

              {/* Form title/desc */}
              <th scope="col" className="px-3.5 py-3 font-medium">
                Form
              </th>

              {/* Status */}
              <th scope="col" className="px-3.5 py-3 w-28 font-medium">
                Status
              </th>

              {/* Responses */}
              <th scope="col" className="px-3.5 py-3 w-24 hidden lg:table-cell font-medium">
                Responses
              </th>

              {/* Views */}
              <th scope="col" className="px-3.5 py-3 w-20 hidden lg:table-cell font-medium">
                Views
              </th>

              {/* Created */}
              <th scope="col" className="px-3.5 py-3 w-28 hidden md:table-cell font-medium">
                Created
              </th>

              {/* Last Updated */}
              <th scope="col" className="px-3.5 py-3 w-32 font-medium">
                Updated
              </th>

              {/* Actions */}
              <th scope="col" className="px-3.5 py-3 w-28 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {forms.map((form) => {
              const isSelected = selectedIds.has(form.id);

              return (
                <tr
                  key={form.id}
                  className={cn(
                    "group transition-colors",
                    isSelected
                      ? "bg-purple-50/50 dark:bg-purple-950/20"
                      : "hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
                  )}
                >
                  {/* Select Checkbox */}
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(form.id)}
                      aria-label={`Select form ${form.title}`}
                      className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                    />
                  </td>

                  {/* Form Thumbnail & Title */}
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center text-zinc-500 shrink-0 overflow-hidden">
                        {form.coverAssetId ? (
                          <img
                            src={`/api/v1/forms/${form.id}/assets/${form.coverAssetId}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(form)}
                          className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate block max-w-xs sm:max-w-md lg:max-w-lg hover:text-purple-600 dark:hover:text-purple-400 text-left transition-colors font-sans cursor-pointer"
                          title={form.title}
                        >
                          {form.title}
                        </button>
                        <p
                          className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-xs sm:max-w-md lg:max-w-lg mt-0.5"
                          title={form.description || "No description"}
                        >
                          {form.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <FormStatusBadge status={form.status} />
                  </td>

                  {/* Responses */}
                  <td className="px-3.5 py-3 text-xs text-zinc-700 dark:text-zinc-300 font-mono font-medium whitespace-nowrap hidden lg:table-cell">
                    {form.responsesCount !== null && form.responsesCount !== undefined
                      ? form.responsesCount
                      : "—"}
                  </td>

                  {/* Views */}
                  <td className="px-3.5 py-3 text-xs text-zinc-700 dark:text-zinc-300 font-mono font-medium whitespace-nowrap hidden lg:table-cell">
                    {form.viewsCount !== null && form.viewsCount !== undefined
                      ? form.viewsCount
                      : "—"}
                  </td>

                  {/* Created */}
                  <td className="px-3.5 py-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap hidden md:table-cell">
                    {formatDate(form.createdAt)}
                  </td>

                  {/* Last Updated */}
                  <td className="px-3.5 py-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">
                    <time
                      dateTime={form.updatedAt}
                      title={formatDateTime(form.updatedAt)}
                      className="cursor-help"
                    >
                      {formatRelativeTime(form.updatedAt)}
                    </time>
                  </td>

                  {/* Actions */}
                  <td className="px-3.5 py-3 whitespace-nowrap text-right">
                    <FormRowActions
                      form={form}
                      onViewDetails={onViewDetails}
                      onRename={onRename}
                      onArchive={onArchive}
                      onRestore={onRestore}
                      onTrash={onTrash}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
