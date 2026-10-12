"use client";

import React from "react";

export type DefaultTextMatcher =
  | string
  | string[]
  | RegExp
  | ((val: string) => boolean);

/**
 * Checks if a given text value matches the untouched default pattern.
 * Supports explicit string, string[], RegExp, custom predicate, or standard Formly defaults.
 */
export function isUntouchedDefaultValue(
  value: string | null | undefined,
  matcher?: DefaultTextMatcher
): boolean {
  if (value === null || value === undefined) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (typeof matcher === "function") {
    return matcher(trimmed);
  }
  if (matcher instanceof RegExp) {
    return matcher.test(trimmed);
  }
  if (Array.isArray(matcher)) {
    return matcher.some((m) => trimmed.toLowerCase() === m.trim().toLowerCase());
  }
  if (typeof matcher === "string") {
    return trimmed.toLowerCase() === matcher.trim().toLowerCase();
  }

  // Common built-in defaults in Formly if no custom matcher provided
  const lower = trimmed.toLowerCase();
  return (
    lower === "untitled form" ||
    lower === "untitled question" ||
    /^option\s+\d+$/i.test(trimmed)
  );
}

/**
 * Tracks whether the element was already focused prior to mouse interaction.
 */
export function handleDefaultTextMouseDown(
  e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  const el = e.currentTarget;
  el.dataset.wasFocused = document.activeElement === el ? "true" : "false";
  el.dataset.isMouseDown = "true";
}

/**
 * Auto-selects text when focused via keyboard (Tab) or programmatically.
 */
export function handleDefaultTextFocus(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  matcher?: DefaultTextMatcher
) {
  const el = e.currentTarget;
  const isDefault = isUntouchedDefaultValue(el.value, matcher);
  const isMouseDown = el.dataset.isMouseDown === "true";

  // If focus was triggered via keyboard (Tab) or programmatically (not during mousedown)
  if (isDefault && !isMouseDown) {
    el.select();
    el.dataset.wasFocused = "true";
  }
}

/**
 * Auto-selects all text on click entering an untouched default field.
 * Allows normal cursor positioning if already focused or if text is customized.
 */
export function handleDefaultTextClick(
  e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>,
  matcher?: DefaultTextMatcher
) {
  const el = e.currentTarget;
  const wasFocused = el.dataset.wasFocused === "true";
  el.dataset.isMouseDown = "false";

  const isDefault = isUntouchedDefaultValue(el.value, matcher);

  if (isDefault) {
    // Only auto-select if the element was NOT already focused prior to this click
    if (!wasFocused) {
      // Respect user drag-selection if user dragged across a substring
      if (el.selectionStart === el.selectionEnd) {
        el.select();
      }
      el.dataset.wasFocused = "true";
    }
  }
}

/**
 * Clears focus tracking dataset flags on blur.
 */
export function handleDefaultTextBlur(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  const el = e.currentTarget;
  el.dataset.wasFocused = "false";
  el.dataset.isMouseDown = "false";
}

/**
 * Convenience props factory to spread onto default text <input> or <textarea> elements.
 */
export function getDefaultTextSelectProps(
  matcher?: DefaultTextMatcher,
  callbacks?: {
    onMouseDown?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onClick?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  }
) {
  return {
    onMouseDown: (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleDefaultTextMouseDown(e);
      callbacks?.onMouseDown?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleDefaultTextFocus(e, matcher);
      callbacks?.onFocus?.(e);
    },
    onClick: (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleDefaultTextClick(e, matcher);
      callbacks?.onClick?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleDefaultTextBlur(e);
      callbacks?.onBlur?.(e);
    },
  };
}
