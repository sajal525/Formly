"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardFormItemDTO } from "../server/get-dashboard-data";
import { formatRelativeTime } from "@/features/forms/utils/formatters";
import {
  MoreVertical,
  Copy,
  Clock,
  Check,
  ExternalLink,
  Edit3,
  AlertCircle,
  RefreshCw,
  Eye,
  MessageSquare,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentFormsSectionProps {
  forms: DashboardFormItemDTO[];
  onCreateClick: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Deterministic, quiet neutral Formly placeholders for forms without user-uploaded covers.
 * Uses restrained geometric and soft gradient patterns; never fake stock photography.
 */
function FormlyNeutralCoverPlaceholder({ index }: { index: number }) {
  const patterns = [
    // 0. Soft lavender abstract wave (matching Image 1 card 2 & 6)
    <div
      key="lavender"
      className="w-full h-full bg-gradient-to-tr from-[#ede9fe] via-[#f5f3ff] to-[#e0e7ff] dark:from-[#2e1065]/40 dark:via-[#1e1b4b]/30 dark:to-[#0f172a] relative overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 80 C 100 120, 200 40, 400 80 L 400 160 L 0 160 Z"
          fill="url(#wave-grad-1)"
        />
        <defs>
          <linearGradient id="wave-grad-1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>,

    // 1. Minimalist frosted slate-sand mesh
    <div
      key="slate"
      className="w-full h-full bg-gradient-to-br from-zinc-100 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950 relative overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-30 dark:opacity-15"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 120 Q 150 60, 300 130 T 400 100 L 400 160 L 0 160 Z"
          fill="currentColor"
          className="text-zinc-400 dark:text-zinc-600"
        />
      </svg>
    </div>,

    // 2. Minimalist subtle monochrome abstract architectural contour
    <div
      key="architectural"
      className="w-full h-full bg-gradient-to-tr from-neutral-200 via-neutral-100 to-stone-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 relative overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-25 dark:opacity-15"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <polygon
          points="0,160 180,40 320,160"
          fill="currentColor"
          className="text-neutral-400 dark:text-zinc-700"
        />
        <polygon
          points="160,160 280,70 400,160"
          fill="currentColor"
          className="text-neutral-500 dark:text-zinc-600 opacity-60"
        />
      </svg>
    </div>,

    // 3. Deep graphite textured monochrome banner
    <div
      key="graphite"
      className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-950 text-zinc-600 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
    </div>,
  ];

  return patterns[index % patterns.length];
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
    router.push(`/forms/${form.id}/edit`);
  };

  const toDateString = (date: Date | string): string => {
    if (date instanceof Date) return date.toISOString();
    return String(date);
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold backdrop-blur-md bg-[#EAF8F1]/95 dark:bg-[#122A1E]/95 text-[#15803D] dark:text-[#4ADE80] border border-[#CDEEDD] dark:border-[#1E4D34] shadow-xs">
            Published
          </span>
        );
      case "CLOSED":
        return (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold backdrop-blur-md bg-rose-50/95 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
            Closed
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold backdrop-blur-md bg-amber-50/95 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
            Archived
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold backdrop-blur-md bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs">
            Draft
          </span>
        );
    }
  };

  return (
    <section className="flex-1 min-h-0 flex flex-col space-y-3 pt-1">
      {/* Header with Title & View all link */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-sans">
          Recent Forms
        </h2>
        {forms.length > 0 && (
          <Link
            href="/my-forms"
            prefetch={true}
            className="text-xs font-semibold text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        )}
      </div>

      {/* 1. Loading Skeleton State (4-column grid matching reference) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4 w-full min-w-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 animate-pulse overflow-hidden flex flex-col justify-between"
            >
              <div className="h-28 w-full bg-zinc-100 dark:bg-zinc-800" />
              <div className="p-3.5 space-y-2">
                <div className="w-3/4 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="w-1/2 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="p-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center">
                <div className="w-20 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="w-12 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* 2. Error / Retry State */
        <div className="p-6 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Failed to load recent forms
            </h3>
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              {error}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      ) : forms.length === 0 ? (
        /* 3. Empty State (Minimal & TUI-Aligned) */
        <div className="flex-1 min-h-[220px] p-6 sm:p-8 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No forms created yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Create your first form to start collecting responses securely.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateClick}
            className="h-8 px-4 rounded-xl bg-[#563BFA] hover:bg-[#4830d9] text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Form</span>
          </button>
        </div>
      ) : (
        /* 4. Populated Grid (4-column grid on desktop, 2 on medium, 1 on mobile) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4 w-full min-w-0">
          {forms.map((form, index) => {
            const isMenuOpen = activeMenuId === form.id;
            const updatedDateStr = toDateString(form.updatedAt);
            const crop = form.coverImage?.transform?.crop;

            const objectPosition = crop
              ? `${Math.max(0, Math.min(100, crop.x + crop.width / 2))}% ${Math.max(0, Math.min(100, crop.y + crop.height / 2))}%`
              : "center";

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
                  "rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 overflow-hidden shadow-2xs"
                )}
              >
                {/* 1. Cover Image Top Half */}
                <div className="h-28 sm:h-32 w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border-b border-zinc-100 dark:border-zinc-800/80">
                  {form.coverAssetId ? (
                    <img
                      src={`/api/v1/forms/${form.id}/assets/${form.coverAssetId}`}
                      alt=""
                      style={{ objectPosition }}
                      className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <FormlyNeutralCoverPlaceholder index={index} />
                  )}

                  {/* Top-Right Status Badge */}
                  {renderBadge(form.status)}
                </div>

                {/* 2. Middle: Title & Description */}
                <div className="p-3.5 space-y-1 min-w-0">
                  <h3
                    className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate font-sans group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                    title={form.title}
                  >
                    {form.title}
                  </h3>
                  <p
                    className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate"
                    title={form.description || "No description provided"}
                  >
                    {form.description || "No description provided"}
                  </p>
                </div>

                {/* 3. Footer: Updated Time, Views, Responses, Context Menu */}
                <div className="px-3.5 pb-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  {/* Left: Clock + Updated relative time */}
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      Updated {formatRelativeTime(updatedDateStr)}
                    </span>
                  </div>

                  {/* Right: Views, Responses, Menu */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <div
                      className="flex items-center gap-1"
                      title={`${form.viewsCount ?? 0} views`}
                    >
                      <Eye className="w-3 h-3 text-zinc-400" />
                      <span>{form.viewsCount ?? 0}</span>
                    </div>

                    <div
                      className="flex items-center gap-1"
                      title={`${form.responsesCount ?? 0} responses`}
                    >
                      <MessageSquare className="w-3 h-3 text-zinc-400" />
                      <span>{form.responsesCount ?? 0}</span>
                    </div>

                    {/* Context Menu Button */}
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
                        className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        aria-label={`Actions for ${form.title}`}
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200/90 dark:border-zinc-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-left font-sans">
                          {/* Edit in Builder */}
                          <Link
                            href={`/forms/${form.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors font-medium"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              Edit in Builder
                            </span>
                          </Link>

                          {/* Public Link (if published) */}
                          {form.status === "PUBLISHED" && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyShareLink(e, form.id)}
                              className="w-full px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors font-medium text-left cursor-pointer"
                            >
                              {copiedId === `link-${form.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              )}
                              <span>
                                {copiedId === `link-${form.id}`
                                  ? "Copied Link!"
                                  : "Copy Share Link"}
                              </span>
                            </button>
                          )}

                          {/* Copy Form ID */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, form.id)}
                            className="w-full px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors font-medium text-left cursor-pointer"
                          >
                            {copiedId === form.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            )}
                            <span>
                              {copiedId === form.id ? "Copied ID!" : "Copy Form ID"}
                            </span>
                          </button>

                          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                          {/* View in My Forms */}
                          <Link
                            href="/my-forms"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>View in My Forms</span>
                          </Link>
                        </div>
                      )}
                    </div>
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
