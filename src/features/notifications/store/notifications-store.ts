"use client";

import {
  NotificationDTO,
  NotificationFilter,
} from "../schemas/notification-schema";

export interface NotificationState {
  notifications: NotificationDTO[];
  unreadCount: number;
  filter: NotificationFilter;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  mutationError: string | null;
  lastFetchedAt: number | null;
  isMarkingAll: boolean;
}

let state: NotificationState = {
  notifications: [],
  unreadCount: 0,
  filter: "all",
  isLoading: false,
  isError: false,
  errorMessage: null,
  mutationError: null,
  lastFetchedAt: null,
  isMarkingAll: false,
};

const listeners = new Set<() => void>();
let inFlightFetch: Promise<void> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Error in notification store listener:", err);
    }
  });
}

function updateState(partial: Partial<NotificationState>) {
  state = { ...state, ...partial };
  notify();
}

/**
 * Fetch notifications from the authenticated endpoint.
 */
export async function fetchNotifications(
  filterToFetch: NotificationFilter = state.filter,
  force = false,
  showLoadingSpinner = true
): Promise<void> {
  const now = Date.now();
  // Reuse fresh data if fetched less than 15s ago unless forced or changing filter
  if (
    !force &&
    state.lastFetchedAt &&
    now - state.lastFetchedAt < 15000 &&
    state.filter === filterToFetch &&
    state.notifications.length > 0
  ) {
    return;
  }

  // Deduplicate concurrent calls
  if (inFlightFetch) {
    return inFlightFetch;
  }

  if (showLoadingSpinner) {
    updateState({ isLoading: true, isError: false, errorMessage: null, filter: filterToFetch });
  } else {
    updateState({ isError: false, errorMessage: null, filter: filterToFetch });
  }

  inFlightFetch = (async () => {
    try {
      const res = await fetch(`/api/v1/notifications?filter=${filterToFetch}&limit=20`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to load notifications (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.success) {
        updateState({
          notifications: data.notifications || [],
          unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : 0,
          isLoading: false,
          isError: false,
          errorMessage: null,
          lastFetchedAt: Date.now(),
        });
      } else {
        throw new Error(data.error || "Failed to load notifications");
      }
    } catch (err: any) {
      console.error("Notifications fetch error:", err);
      updateState({
        isLoading: false,
        isError: true,
        errorMessage: err?.message || "Unable to load notifications",
      });
    } finally {
      inFlightFetch = null;
    }
  })();

  return inFlightFetch;
}

/**
 * Optimistically mark a single notification as read with rollback on failure.
 */
export async function markAsRead(item: NotificationDTO): Promise<{ success: boolean; error?: string }> {
  if (item.readAt) {
    return { success: true };
  }

  const previousNotifications = state.notifications;
  const previousUnread = state.unreadCount;
  const nowIso = new Date().toISOString();

  // Optimistic update
  updateState({
    notifications: state.notifications.map((n) =>
      n.id === item.id ? { ...n, readAt: nowIso } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
    mutationError: null,
  });

  try {
    const res = await fetch(`/api/v1/notifications/${item.id}`, {
      method: "PATCH",
    });

    if (!res.ok) {
      throw new Error("Server rejected read status update");
    }

    const data = await res.json();
    if (typeof data.unreadCount === "number") {
      updateState({ unreadCount: data.unreadCount });
    }
    return { success: true };
  } catch (err: any) {
    console.error("Failed to mark notification read:", err);
    // Rollback
    updateState({
      notifications: previousNotifications,
      unreadCount: previousUnread,
      mutationError: "Could not mark notification as read. Please try again.",
    });
    return { success: false, error: err?.message || "Failed to update notification" };
  }
}

/**
 * Optimistically mark all notifications as read with rollback on failure.
 */
export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  if (state.unreadCount === 0 || state.isMarkingAll) {
    return { success: true };
  }

  const previousNotifications = state.notifications;
  const previousUnread = state.unreadCount;
  const nowIso = new Date().toISOString();

  updateState({
    isMarkingAll: true,
    notifications: state.notifications.map((n) => ({
      ...n,
      readAt: n.readAt || nowIso,
    })),
    unreadCount: 0,
    mutationError: null,
  });

  try {
    const res = await fetch("/api/v1/notifications/read-all", {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Server rejected mark-all-read request");
    }

    const data = await res.json();
    updateState({
      isMarkingAll: false,
      unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : 0,
    });
    return { success: true };
  } catch (err: any) {
    console.error("Mark all as read failed:", err);
    // Rollback
    updateState({
      isMarkingAll: false,
      notifications: previousNotifications,
      unreadCount: previousUnread,
      mutationError: "Could not mark all as read. Please try again.",
    });
    return { success: false, error: err?.message || "Failed to mark all as read" };
  }
}

export function clearMutationError() {
  updateState({ mutationError: null });
}

export function setNotificationFilter(filter: NotificationFilter) {
  if (state.filter !== filter) {
    updateState({ filter });
    fetchNotifications(filter, true, true);
  }
}

/**
 * Global Polling & Focus Handlers
 */
function handleWindowFocus() {
  const now = Date.now();
  if (!state.lastFetchedAt || now - state.lastFetchedAt > 20000) {
    fetchNotifications(state.filter, true, false);
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    handleWindowFocus();
  }
}

function startPolling() {
  if (typeof window === "undefined") return;
  if (!pollTimer) {
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Modest background poll every 60 seconds when visible
    pollTimer = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications(state.filter, false, false);
      }
    }, 60000);
  }
}

function stopPollingIfNoListeners() {
  if (listeners.size === 0 && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }
}

export function getNotificationSnapshot(): NotificationState {
  return state;
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  startPolling();

  // Initial fetch if uninitialized
  if (!state.lastFetchedAt && !inFlightFetch) {
    fetchNotifications(state.filter, false, false);
  }

  return () => {
    listeners.delete(listener);
    stopPollingIfNoListeners();
  };
}
