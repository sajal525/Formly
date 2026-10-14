"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  FileText,
  Users,
  Activity,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { NotificationDTO } from "../schemas/notification-schema";
import { useNotifications } from "../hooks/use-notifications";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationsPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [navWarning, setNavWarning] = useState<string | null>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    filter,
    isLoading,
    isError,
    mutationError,
    isMarkingAll,
    refresh,
    setFilter,
    markAsRead,
    markAllAsRead,
    clearError,
  } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate anchored fixed position relative to bell button
  const updatePosition = useCallback(() => {
    if (!bellButtonRef.current) return;
    const rect = bellButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 640;

    if (isMobile) {
      const margin = 12;
      setPanelStyle({
        position: "fixed",
        top: `${Math.min(rect.bottom + 8, viewportHeight - 120)}px`,
        left: `${margin}px`,
        right: `${margin}px`,
        width: `calc(100vw - ${margin * 2}px)`,
        maxHeight: `calc(100vh - ${rect.bottom + 20}px)`,
      });
    } else {
      const panelWidth = 380;
      const padding = 16;
      let rightPos = viewportWidth - rect.right;
      if (rightPos < padding) rightPos = padding;
      if (viewportWidth - rightPos - panelWidth < padding) {
        rightPos = Math.max(padding, viewportWidth - panelWidth - padding);
      }

      setPanelStyle({
        position: "fixed",
        top: `${Math.min(rect.bottom + 8, viewportHeight - 120)}px`,
        right: `${rightPos}px`,
        width: `${panelWidth}px`,
        maxHeight: `calc(100vh - ${rect.bottom + 20}px)`,
      });
    }
  }, []);

  // Update position when opened, resized, or scrolled
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { capture: true, passive: true });

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // When opening, refresh notifications
  useEffect(() => {
    if (isOpen) {
      refresh(filter, false);
      setNavWarning(null);
    }
  }, [isOpen, filter, refresh]);

  // Outside click & Escape handlers
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        bellButtonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Handle clicking a notification row
  const handleItemClick = async (item: NotificationDTO) => {
    setNavWarning(null);

    // Optimistically mark as read
    await markAsRead(item);

    // If destination is missing or trashed, notify user gracefully
    if (item.destinationUnavailable || !item.targetHref) {
      setNavWarning("This form or destination is no longer available or was moved to trash.");
      return;
    }

    setIsOpen(false);
    router.push(item.targetHref);
  };

  const visibleCountBadge = unreadCount > 99 ? "99+" : unreadCount;
  const accessibleLabel =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications, no unread";
  const tooltipText =
    unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications";

  return (
    <>
      {/* Topbar Bell Trigger Button */}
      <button
        ref={bellButtonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#563BFA] focus-visible:ring-offset-2 shrink-0",
          isOpen && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
        )}
        aria-label={accessibleLabel}
        title={tooltipText}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="notifications-popover-panel"
      >
        <Bell className="w-4 h-4" />

        {/* Real Unread Count Badge (matches Formly builder design) */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 leading-none shadow-xs pointer-events-none select-none animate-in zoom-in-75 duration-150"
            aria-hidden="true"
          >
            {visibleCountBadge}
          </span>
        )}
      </button>

      {/* Floating Popover Panel Mounted in Portal outside clipping containers */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={panelRef}
            id="notifications-popover-panel"
            role="dialog"
            aria-label="Notifications"
            aria-modal="false"
            style={panelStyle}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="z-[45] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
          >
            {/* Header Row: Title & Mark all as read */}
            <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950/80 text-[#563BFA] dark:text-indigo-300">
                    {visibleCountBadge}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0 || isMarkingAll}
                className="text-xs font-semibold text-[#563BFA] dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:no-underline transition-opacity"
              >
                {isMarkingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Mark all as read</span>
              </button>
            </div>

            {/* Filter Pills Row: All & Unread */}
            <div className="px-4 sm:px-5 py-2.5 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-slate-900/40">
              <div
                role="tablist"
                aria-label="Notification filters"
                className="inline-flex items-center p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === "all"}
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#563BFA]",
                    filter === "all"
                      ? "bg-white dark:bg-slate-700 text-[#563BFA] dark:text-indigo-300 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  All
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === "unread"}
                  onClick={() => setFilter("unread")}
                  className={cn(
                    "px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#563BFA]",
                    filter === "unread"
                      ? "bg-white dark:bg-slate-700 text-[#563BFA] dark:text-indigo-300 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-violet-100 dark:bg-violet-950/80 text-[#563BFA] dark:text-indigo-300 font-bold">
                      {visibleCountBadge}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mutation Failure Alert */}
            {mutationError && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mutationError}</span>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-md transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Navigation Warning (for missing or trashed destinations) */}
            {navWarning && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{navWarning}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNavWarning(null)}
                  className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md transition-colors"
                  aria-label="Dismiss warning"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Body Content Region */}
            <div className="min-h-[220px] max-h-[380px] overflow-y-auto flex flex-col justify-center">
              {/* 1. Compact Skeleton Loading State */}
              {isLoading && notifications.length === 0 && (
                <div className="p-4 space-y-3.5" role="status" aria-label="Loading notifications...">
                  <span className="sr-only">Loading notifications...</span>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Error State */}
              {!isLoading && isError && (
                <div className="py-10 px-6 text-center flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="w-7 h-7 text-rose-500" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Unable to load notifications
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Check your connection and try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => refresh(filter, true)}
                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* 3. Empty State (Matching reference design) */}
              {!isLoading && !isError && notifications.length === 0 && (
                <div className="py-8 px-6 text-center flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 rounded-full bg-violet-50/80 dark:bg-violet-950/40 flex items-center justify-center text-[#563BFA] dark:text-indigo-400 mb-3 shadow-inner">
                    <Bell className="w-8 h-8 stroke-[1.75]" />
                    <Sparkles className="w-3.5 h-3.5 absolute top-2 left-2.5 text-violet-400 dark:text-indigo-400" />
                    <span className="absolute top-2 right-2.5 text-violet-400 dark:text-indigo-400 text-xs font-black">
                      ✦
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    You&apos;re all caught up
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                    {filter === "unread"
                      ? "No unread notifications right now."
                      : "New form activity will appear here."}
                  </p>

                  <div className="w-full mt-6 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-start text-[11px] text-slate-400 gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {filter === "unread" ? "All notifications are read" : "No new notifications"}
                    </span>
                  </div>
                </div>
              )}

              {/* 4. Populated Notifications List */}
              {!isLoading && !isError && notifications.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-white/5 h-full">
                  {notifications.map((item) => {
                    const isUnread = !item.readAt;

                    return (
                      <div
                        key={item.id}
                        data-notification-id={item.id}
                        onClick={() => handleItemClick(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleItemClick(item);
                          }
                        }}
                        className={cn(
                          "p-4 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800/60",
                          isUnread && "bg-indigo-50/30 dark:bg-indigo-950/20"
                        )}
                      >
                        {/* Event Type Icon */}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                            item.type === "FORM_RESPONSE"
                              ? "bg-violet-100 text-[#563BFA] dark:bg-violet-950/70 dark:text-violet-300"
                              : item.type === "COLLABORATOR_INVITATION"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300"
                              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300"
                          )}
                        >
                          {item.type === "FORM_RESPONSE" ? (
                            <FileText className="w-4 h-4" />
                          ) : item.type === "COLLABORATOR_INVITATION" ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                        </div>

                        {/* Content details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </p>
                            <span
                              className="text-[10px] font-medium text-slate-400 shrink-0"
                              title={new Date(item.createdAt).toLocaleString()}
                            >
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.message}
                          </p>

                          {item.destinationUnavailable && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              (Form moved to trash)
                            </span>
                          )}
                        </div>

                        {/* Unread indicator dot */}
                        {isUnread && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#563BFA] dark:bg-indigo-400 shrink-0 mt-1.5"
                            title="Unread notification"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
