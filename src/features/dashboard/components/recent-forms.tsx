"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardFormItemDTO } from "../server/get-dashboard-data";
import { FormStatusBadge } from "@/features/forms/components/form-status-badge";
import { formatDate, formatRelativeTime } from "@/features/forms/utils/formatters";
import {
  FileText,
  FilePlus,
  MoreVertical,
  Copy,
  Clock,
  Calendar,
  Check,
  ExternalLink,
  Edit3,
  BarChart2,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentFormsSectionProps {
  forms: DashboardFormItemDTO[];
  onCreateClick: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function RecentFormsSection({
  forms,
  onCreateClick,
  isLoading = false,
  error = null,
  onRetry,
}: RecentFormsSectionProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenuId]);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  };

  const handleCopyShareLink = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(`link-${formId}`);
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  };

  const handleCardClick = (form: DashboardFormItemDTO) => {
    if (form.status === "DRAFT") {
      router.push(`/forms/${form.id}/edit`);
    } else {
      router.push(`/forms/${form.id}/edit`);
    }
  };

  const toDateString = (date: Date | string): string => {
    if (date instanceof Date) return date.toISOString();
    return String(date);
  };

  return (
    <section className="flex-1 min-h-0 flex flex-col space-y-3">
      {/* Header with Title & View all link */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Recent Forms
        </h2>
        {forms.length > 0 && (
          <Link
            href="/my-forms"
            prefetch={true}
            className="text-xs font-semibold text-slate-400 hover:text-[#563BFA] dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        )}
      </div>

      {/* 1. Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs animate-pulse flex flex-col justify-between gap-4 min-h-[220px]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                <div className="w-16 h-5 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-4 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="w-full h-3 rounded-md bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                <div className="w-1/2 h-3 rounded-md bg-slate-100 dark:bg-slate-800" />
                <div className="w-1/3 h-3 rounded-md bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* 2. Error / Retry State */
        <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Failed to load recent forms
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {error}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      ) : forms.length === 0 ? (
        /* 3. Empty State */
        <div className="flex-1 min-h-[160px] p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] dark:bg-indigo-950/60 text-[#563BFA] dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <FilePlus className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              No forms created yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Start by creating your first form. Your forms will be saved and synced securely in Neon PostgreSQL.
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
        /* 4. Populated Grid State (3 cols on desktop, 2 on medium, 1 on mobile) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
          {forms.map((form) => {
            const isMenuOpen = activeMenuId === form.id;
            const updatedDateStr = toDateString(form.updatedAt);
            const createdDateStr = toDateString(form.createdAt);

            return (
              <div
                key={form.id}
                role="article"
                tabIndex={0}
                onClick={() => handleCardClick(form)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(form);
                  }
                }}
                className={cn(
                  "p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all flex flex-col justify-between gap-4 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#563BFA] focus-visible:ring-offset-2 min-w-0 overflow-hidden"
                )}
              >
                {/* Card Top: Icon / Thumbnail + Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EEF0FF] dark:bg-indigo-950/60 border border-indigo-100/70 dark:border-indigo-900/40 flex items-center justify-center text-[#563BFA] dark:text-indigo-400 shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                    {form.coverAssetId ? (
                      <img
                        src={`/api/v1/forms/${form.id}/assets/${form.coverAssetId}`}
                        alt=""
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  <FormStatusBadge status={form.status} />
                </div>

                {/* Card Middle: Title & Description */}
                <div className="space-y-1.5 min-w-0">
                  <h3
                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#563BFA] dark:group-hover:text-indigo-400 transition-colors"
                    title={form.title}
                  >
                    {form.title}
                  </h3>
                  <p
                    className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed break-words"
                    title={form.description || "Draft form record"}
                  >
                    {form.description || "No description provided"}
                  </p>
                </div>

                {/* Card Metrics & Timestamps Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {/* Updated and Created Timestamps */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Updated {formatRelativeTime(updatedDateStr)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(createdDateStr)}</span>
                    </div>
                  </div>

                  {/* Responses & Views Counts */}
                  <div className="flex items-center justify-between pt-0.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 dark:text-slate-500">Responses:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {form.responsesCount !== undefined && form.responsesCount !== null
                          ? form.responsesCount
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 dark:text-slate-500">Views:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {form.viewsCount !== undefined && form.viewsCount !== null
                          ? form.viewsCount
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Primary View/Edit link + Actions Overflow Menu */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#563BFA] dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                    <span>{form.status === "DRAFT" ? "Edit form" : "View form"}</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>

                  {/* Contextual Actions Menu (Isolated Click Target) */}
                  <div
                    className="relative"
                    ref={isMenuOpen ? menuRef : undefined}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : form.id);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label={`Actions for ${form.title}`}
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-left">
                        {/* Open in Builder */}
                        <Link
                          href={`/forms/${form.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#563BFA] shrink-0" />
                          <span className="font-semibold text-[#563BFA] dark:text-indigo-400">
                            Edit in Builder
                          </span>
                        </Link>

                        {/* Public Link (if published) */}
                        {form.status === "PUBLISHED" && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyShareLink(e, form.id)}
                            className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium text-left cursor-pointer"
                          >
                            {copiedId === `link-${form.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span>
                              {copiedId === `link-${form.id}` ? "Copied Link!" : "Copy Share Link"}
                            </span>
                          </button>
                        )}

                        {/* Copy Form ID */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, form.id)}
                          className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium text-left cursor-pointer"
                        >
                          {copiedId === form.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>
                            {copiedId === form.id ? "Copied ID!" : "Copy Form ID"}
                          </span>
                        </button>

                        <div className="my-1 border-t border-slate-100 dark:border-white/5" />

                        {/* View in My Forms */}
                        <Link
                          href="/my-forms"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>View in My Forms</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
