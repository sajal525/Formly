"use client";

import React from "react";
import { MyFormItemDTO } from "../server/get-my-forms-page";
import { FormThumbnail } from "./form-thumbnail";
import { FormStatusBadge } from "./form-status-badge";
import { FormRowActions } from "./form-row-actions";
import { formatDate, formatDateTime, formatRelativeTime } from "../utils/formatters";

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
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {/* Checkbox */}
              <th scope="col" className="w-12 px-4 py-3.5 text-center">
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
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#563BFA] focus:ring-[#563BFA] accent-[#563BFA] cursor-pointer"
                />
              </th>

              {/* Form title/desc */}
              <th scope="col" className="px-4 py-3.5">
                Form
              </th>

              {/* Status */}
              <th scope="col" className="px-4 py-3.5 w-28">
                Status
              </th>

              {/* Responses (truthful —) */}
              <th scope="col" className="px-4 py-3.5 w-24 hidden lg:table-cell">
                Responses
              </th>

              {/* Views (truthful —) */}
              <th scope="col" className="px-4 py-3.5 w-20 hidden lg:table-cell">
                Views
              </th>

              {/* Created */}
              <th scope="col" className="px-4 py-3.5 w-32 hidden md:table-cell">
                Created
              </th>

              {/* Last Updated */}
              <th scope="col" className="px-4 py-3.5 w-36">
                Last Updated
              </th>

              {/* Actions */}
              <th scope="col" className="px-4 py-3.5 w-28 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {forms.map((form) => {
              const isSelected = selectedIds.has(form.id);

              return (
                <tr
                  key={form.id}
                  className={`group transition-colors ${
                    isSelected
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(form.id)}
                      aria-label={`Select form ${form.title}`}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#563BFA] focus:ring-[#563BFA] accent-[#563BFA] cursor-pointer"
                    />
                  </td>

                  {/* Form Thumbnail & Title */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <FormThumbnail themeKey={form.themeKey} />
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(form)}
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate block max-w-xs sm:max-w-md lg:max-w-lg hover:text-[#563BFA] dark:hover:text-indigo-400 text-left transition-colors"
                          title={form.title}
                        >
                          {form.title}
                        </button>
                        <p
                          className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs sm:max-w-md lg:max-w-lg mt-0.5"
                          title={form.description || "No description"}
                        >
                          {form.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <FormStatusBadge status={form.status} />
                  </td>

                  {/* Responses */}
                  <td className="px-4 py-3.5 text-xs text-slate-400 font-medium whitespace-nowrap hidden lg:table-cell">
                    —
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3.5 text-xs text-slate-400 font-medium whitespace-nowrap hidden lg:table-cell">
                    —
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap hidden md:table-cell">
                    {formatDate(form.createdAt)}
                  </td>

                  {/* Last Updated */}
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <time
                      dateTime={form.updatedAt}
                      title={formatDateTime(form.updatedAt)}
                      className="cursor-help"
                    >
                      {formatRelativeTime(form.updatedAt)}
                    </time>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
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
