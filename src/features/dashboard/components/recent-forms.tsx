"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DashboardFormItemDTO } from "../server/get-dashboard-data";
import {
  FileText,
  FilePlus,
  MoreVertical,
  Copy,
  Clock,
  Check,
  ExternalLink,
} from "lucide-react";

interface RecentFormsSectionProps {
  forms: DashboardFormItemDTO[];
  onCreateClick: () => void;
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export function RecentFormsSection({
  forms,
  onCreateClick,
}: RecentFormsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCopyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  }

  // Row icon colors cycle
  const iconColors = [
    "bg-blue-100 text-[#329CF5] dark:bg-blue-950/60 dark:text-blue-400",
    "bg-violet-100 text-[#563BFA] dark:bg-violet-950/60 dark:text-violet-400",
    "bg-pink-100 text-pink-500 dark:bg-pink-950/60 dark:text-pink-400",
    "bg-amber-100 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400",
    "bg-emerald-100 text-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-400",
  ];

  return (
    <section className="flex-1 min-h-0 flex flex-col space-y-2">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Recent Forms
        </h2>
        {forms.length > 0 && (
          <Link
            href="/my-forms"
            prefetch={true}
            className="text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            View all →
          </Link>
        )}
      </div>

      {forms.length === 0 ? (
        /* Empty State */
        <div className="flex-1 min-h-[150px] p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] dark:bg-indigo-950/60 text-[#563BFA] dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <FilePlus className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              No forms created yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Start by creating your first blank draft form. Your forms will be saved and synced securely in Neon PostgreSQL.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateClick}
            className="h-9 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-[#5938F5] to-[#7B52F8] hover:from-[#492de0] hover:to-[#6c40e5] text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Create your first form</span>
          </button>
        </div>
      ) : (
        /* Forms Table */
        <div className="flex-1 min-h-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs flex flex-col">
          {/* Desktop Table */}
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-xs border-b border-slate-200/60 dark:border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-4">Title</th>
                  <th scope="col" className="py-3.5 px-4 hidden sm:table-cell">Responses</th>
                  <th scope="col" className="py-3.5 px-4 hidden md:table-cell">Views</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 hidden sm:table-cell">Updated</th>
                  <th scope="col" className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {forms.map((form, idx) => (
                  <tr
                    key={form.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Title */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                            iconColors[idx % iconColors.length]
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                          <Link
                            href={`/forms/${form.id}/edit`}
                            prefetch={true}
                            className="font-bold text-slate-900 dark:text-white truncate text-xs sm:text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                          >
                            {form.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 truncate">
                            {form.description || "Draft form record"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Responses */}
                    <td className="py-4 px-4 hidden sm:table-cell text-slate-400 font-mono">
                      <span title="Responses tracking in future step">—</span>
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 hidden md:table-cell text-slate-400 font-mono">
                      <span title="Views tracking in future step">—</span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-[#563BFA] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#563BFA] animate-pulse" />
                        {form.status.toLowerCase()}
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="py-4 px-4 hidden sm:table-cell text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatRelativeTime(form.updatedAt)}</span>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 pr-6 pl-4 text-right relative">
                      <div className="inline-block text-left" ref={activeMenuId === form.id ? menuRef : undefined}>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === form.id ? null : form.id
                            )
                          }
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Form actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === form.id && (
                          <div className="absolute right-6 top-10 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                            <button
                              type="button"
                              onClick={() => handleCopyId(form.id)}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                            >
                              {copiedId === form.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>
                                {copiedId === form.id ? "Copied ID!" : "Copy Form ID"}
                              </span>
                            </button>
                            <Link
                              href={`/forms/${form.id}/edit`}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                              <span>Open in Builder</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
