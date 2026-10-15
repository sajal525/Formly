"use client";

import { useState, useEffect } from "react";

export const AVATAR_UPDATED_EVENT = "formly:avatar-updated";
export const AVATAR_STORAGE_KEY = "formly:avatar-sync";
export const AVATAR_BROADCAST_CHANNEL = "formly:avatar-channel";

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(AVATAR_BROADCAST_CHANNEL);
    } catch {
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
}

/**
 * Dispatches an event across the current window and across browser tabs
 * whenever the authenticated user updates or removes their avatar photo.
 */
export function notifyAvatarUpdated(avatarUrl: string | null) {
  if (typeof window === "undefined") return;

  // 1. Dispatch custom event within current window
  window.dispatchEvent(
    new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { avatarUrl } })
  );

  // 2. Broadcast across tabs via BroadcastChannel if supported
  try {
    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ avatarUrl, timestamp: Date.now() });
    }
  } catch {
    // Ignore BroadcastChannel errors
  }

  // 3. Broadcast across tabs via localStorage event as fallback
  try {
    localStorage.setItem(
      AVATAR_STORAGE_KEY,
      JSON.stringify({ avatarUrl, timestamp: Date.now() })
    );
  } catch {
    // Ignore quota or private mode errors
  }
}

/**
 * Hook to keep the current user's avatar reactive to real-time updates and removals
 * without requiring page reload, route navigation, or sign-out.
 */
export function useCurrentUserAvatar(initialAvatarUrl?: string | null): string | null {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl ?? null);
  }, [initialAvatarUrl]);

  useEffect(() => {
    function handleAvatarEvent(e: Event) {
      const customEvent = e as CustomEvent<{ avatarUrl: string | null }>;
      if (customEvent.detail !== undefined) {
        setAvatarUrl(customEvent.detail.avatarUrl);
      }
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === AVATAR_STORAGE_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          setAvatarUrl(data.avatarUrl ?? null);
        } catch {
          // Ignore parse errors
        }
      }
    }

    function handleBroadcast(event: MessageEvent) {
      if (event?.data && "avatarUrl" in event.data) {
        setAvatarUrl(event.data.avatarUrl ?? null);
      }
    }

    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarEvent);
    window.addEventListener("storage", handleStorage);

    const channel = getBroadcastChannel();
    if (channel) {
      channel.addEventListener("message", handleBroadcast);
    }

    return () => {
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarEvent);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.removeEventListener("message", handleBroadcast);
      }
    };
  }, []);

  return avatarUrl;
}
