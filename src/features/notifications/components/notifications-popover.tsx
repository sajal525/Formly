"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import {
  NotificationDTO,
  NotificationFilter,
} from "../schemas/notification-schema";
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
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch notifications from server
  const fetchNotifications = useCallback(
    async (currentFilter: NotificationFilter = filter, showLoadingSpinner = true) => {
      if (showLoadingSpinner) {
        setIsLoading(true);
      }
      setIsError(false);

      try {
        const res = await fetch(`/api/v1/notifications?filter=${currentFilter}&limit=20`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to load notifications");
        }

        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
        } else {
          throw new Error(data.error || "Failed to parse notification payload");
        }
      } catch (err) {
        console.error("Notifications fetch error:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [filter]
  );

  // Initial unread count fetch on mount
  useEffect(() => {
    fetchNotifications("all", false);
  }, [fetchNotifications]);

  // Fetch on window regain focus
  useEffect(() => {
    function handleFocus() {
      fetchNotifications(filter, false);
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchNotifications, filter]);

  // Refresh when popover opens or filter changes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(filter, true);
    }
  }, [isOpen, filter, fetchNotifications]);

  // Outside click and Escape key handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        bellButtonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Mark single notification read on click and navigate
  const handleItemClick = async (item: NotificationDTO) => {
    // Optimistic read update
    if (!item.readAt) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Persist to server
      fetch(`/api/v1/notifications/${item.id}`, { method: "PATCH" }).catch(
        (err) => console.error("Error marking notification read:", err)
      );
    }

    setIsOpen(false);

    if (item.targetHref) {
      router.push(item.targetHref);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    // Optimistic update
    const previousNotifications = notifications;
    const previousUnread = unreadCount;
    const nowIso = new Date().toISOString();

    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || nowIso })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/v1/notifications/read-all", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to mark all as read");
      }
      const data = await res.json();
      if (typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
      // Rollback on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnread);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Topbar Bell Trigger Button */}
      <button
        ref={bellButtonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer",
          isOpen && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
        )}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications, no unread"
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="notifications-popover-panel"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Indicator Badge (matching reference screenshot) */}
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#563BFA] ring-2 ring-white dark:ring-slate-900"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Floating Popover Panel */}
      {isOpen && (
        <div
          id="notifications-popover-panel"
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-12 w-[340px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        >
          {/* Header Row: Title & Mark all as read */}
          <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Notifications
            </h2>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="text-xs font-semibold text-[#563BFA] dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:no-underline transition-opacity"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          </div>

          {/* Filter Pills Row: All & Unread */}
          <div className="px-4 sm:px-5 py-2.5 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-slate-900/40">
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filter === "all"
                    ? "bg-white dark:bg-slate-700 text-[#563BFA] dark:text-indigo-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-3.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  filter === "unread"
                    ? "bg-white dark:bg-slate-700 text-[#563BFA] dark:text-indigo-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-violet-100 dark:bg-violet-950/80 text-[#563BFA] dark:text-indigo-300 font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Body Content Region */}
          <div className="min-h-[220px] max-h-[380px] overflow-y-auto flex flex-col justify-center">
            {/* 1. Loading State */}
            {isLoading && notifications.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#563BFA] dark:text-indigo-400" />
                <span className="text-xs font-medium">Loading notifications...</span>
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
                  onClick={() => fetchNotifications(filter, true)}
                  className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* 3. Empty State (Matching reference screenshot exactly) */}
            {!isLoading && !isError && notifications.length === 0 && (
              <div className="py-8 px-6 text-center flex flex-col items-center justify-center">
                {/* Styled Bell Illustration */}
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
                  New form activity will appear here.
                </p>

                {/* Sub-footer inside empty state card */}
                <div className="w-full mt-6 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-start text-[11px] text-slate-400 gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>No new notifications</span>
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
                        "p-4 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer group",
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
                      </div>

                      {/* Unread purple indicator dot */}
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
        </div>
      )}
    </div>
  );
}
