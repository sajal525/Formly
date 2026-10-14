"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  getNotificationSnapshot,
  subscribeNotifications,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  setNotificationFilter,
  clearMutationError,
} from "../store/notifications-store";
import { NotificationDTO, NotificationFilter } from "../schemas/notification-schema";

export function useNotifications() {
  const store = useSyncExternalStore(
    subscribeNotifications,
    getNotificationSnapshot,
    getNotificationSnapshot
  );

  const refresh = useCallback(
    (filter?: NotificationFilter, force = true) => {
      return fetchNotifications(filter, force, true);
    },
    []
  );

  const setFilter = useCallback((filter: NotificationFilter) => {
    setNotificationFilter(filter);
  }, []);

  const markItemAsRead = useCallback((item: NotificationDTO) => {
    return markAsRead(item);
  }, []);

  const markAllItemsAsRead = useCallback(() => {
    return markAllAsRead();
  }, []);

  const clearError = useCallback(() => {
    clearMutationError();
  }, []);

  return {
    ...store,
    refresh,
    setFilter,
    markAsRead: markItemAsRead,
    markAllAsRead: markAllItemsAsRead,
    clearError,
  };
}
