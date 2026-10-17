"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Undo2,
  Redo2,
  Eye,
  Send,
  Share2,
  MoreVertical,
  Bell,
  Check,
  Copy,
  ExternalLink,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutosaveIndicator, AutosaveStatus } from "./autosave-indicator";
import { ThemeToggle } from "@/components/branding/theme-toggle";
import { NotificationsPopover } from "@/features/notifications/components/notifications-popover";
import {
  getDefaultTextSelectProps,
  isUntouchedDefaultValue,
} from "../utils/default-text-select";
import { cn } from "@/lib/utils";

interface BuilderTopbarProps {
  formId: string;
  title: string;
  onTitleChange: (newTitle: string) => void;
  autosaveStatus: AutosaveStatus;
  lastSavedAt?: string;
  autosaveError?: string | null;
  onRetryAutosave?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  activeTab: "questions" | "theme" | "settings" | "preview";
  onTabChange: (tab: "questions" | "theme" | "settings" | "preview") => void;
  onPublishClick: () => void;
  isPublishing?: boolean;
  isPublished?: boolean;
  user?: {
    username?: string;
    displayName?: string;
  };
}

export function BuilderTopbar({
  formId,
  title,
  onTitleChange,
  autosaveStatus,
  lastSavedAt,
  autosaveError,
  onRetryAutosave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  activeTab,
  onTabChange,
  onPublishClick,
  isPublishing,
  isPublished = false,
  user,
}: BuilderTopbarProps) {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [origin, setOrigin] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      if (isUntouchedDefaultValue(tempTitle, "Untitled form")) {
        titleInputRef.current.select();
      }
    }
  }, [isEditingTitle, tempTitle]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveTitle = () => {
    const trimmed = tempTitle.trim();
    const finalTitle = trimmed || "Untitled form";
    onTitleChange(finalTitle);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.stopPropagation();
      titleInputRef.current?.select();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setTempTitle(title);
      setIsEditingTitle(false);
    }
  };

  const publicUrl = `${origin}/f/${formId}`;
  const previewUrl = `${origin}/forms/${formId}/preview`;

  const handleCopyLink = (urlToCopy: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const userInitial = (user?.displayName || user?.username || "F").charAt(0).toUpperCase();

  return (
    <header className="h-[56px] shrink-0 border-b border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] px-4 flex items-center justify-between gap-3 select-none z-30 transition-colors">
      {/* Left side: Back button & editable title & autosave pill */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => router.push("/my-forms")}
          className="w-7 h-7 rounded-lg border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-[#181B20] transition-colors"
          title="Back to My Forms"
          aria-label="Back to My Forms"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        {/* Editable Title */}
        <div className="flex items-center gap-1.5 max-w-[130px] sm:max-w-xs md:max-w-sm lg:max-w-md min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1 min-w-0">
              <input
                ref={titleInputRef}
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={120}
                className="h-7 px-2 py-0.5 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-[#181B20] border border-[#563BFA] rounded-md focus:outline-none w-full min-w-0 transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
                {...getDefaultTextSelectProps("Untitled form", {
                  onBlur: handleSaveTitle,
                })}
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                title="Save title"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 text-left truncate rounded px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-[#181B20] transition-colors min-w-0"
              title="Click to edit form title"
            >
              <h1 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                {title}
              </h1>
              <Pencil className="w-3 h-3 text-neutral-400 group-hover:text-[#563BFA] transition-colors shrink-0" />
            </button>
          )}
        </div>

        {/* Autosave status indicator badge */}
        <div className="hidden sm:block">
          <AutosaveIndicator
            status={autosaveStatus}
            lastSavedAt={lastSavedAt}
            error={autosaveError}
            onRetry={onRetryAutosave}
            onReload={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
          />
        </div>
      </div>

      {/* Right side: History (Undo/Redo), Theme toggle, Notifications, User, Share, Publish, More */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Undo / Redo controls */}
        <div className="hidden md:flex items-center gap-1 border-r border-slate-200 dark:border-white/10 pr-2 mr-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              canUndo
                ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              canRedo
                ? "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Theme appearance toggle (matches B4.png) */}
        <div className="hidden sm:block">
          <ThemeToggle className="w-8 h-8 rounded-lg" />
        </div>

        {/* Shared Notifications Popover (visible across desktop, tablet, and mobile) */}
        <NotificationsPopover />

        {/* User Pill (desktop) */}
        <div className="hidden lg:flex items-center gap-2 border-r border-[#E5E7EB] dark:border-[#27272A] pr-2.5 mr-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-xs font-mono">
            <span className="w-4 h-4 rounded bg-[#563BFA] text-white flex items-center justify-center text-[10px] font-bold">
              {userInitial}
            </span>
            <span className="text-neutral-700 dark:text-neutral-300 max-w-[80px] truncate">
              {user?.displayName || user?.username || "Flash"}
            </span>
          </div>
        </div>

        {/* Share Button */}
        <div className="relative" ref={shareMenuRef}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsShareMenuOpen((prev) => !prev)}
            className="gap-1.5 text-xs font-mono font-medium rounded-md h-7 px-2.5 border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#121417] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181B20]"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {isShareMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-lg shadow-xl p-3.5 z-50 text-xs font-mono space-y-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#27272A]">
                <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">Share Form</span>
                {isPublished ? (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Live
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-100 dark:bg-[#181B20] text-neutral-600 dark:text-neutral-400">
                    Draft
                  </span>
                )}
              </div>

              {isPublished ? (
                /* Published Link */
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    Public Respondent URL
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="flex-1 h-7 px-2 rounded-md bg-neutral-50 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] text-xs text-neutral-800 dark:text-neutral-200 font-mono select-all focus:outline-none truncate"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCopyLink(publicUrl)}
                      className="h-7 px-2.5 rounded-md bg-[#563BFA] hover:bg-[#4830d9] text-white text-xs font-mono font-medium gap-1 shrink-0 shadow-none"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#563BFA] dark:text-[#a594fd] hover:underline flex items-center gap-1"
                    >
                      <span>Open in new tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Draft Notice */
                <div className="space-y-2.5">
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                    This form is currently a draft. Publish to generate an active public link for respondents.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsShareMenuOpen(false);
                      onPublishClick();
                    }}
                    className="w-full h-7 rounded-md bg-[#563BFA] hover:bg-[#4830d9] text-white text-xs font-mono font-medium gap-1.5 shadow-none"
                  >
                    <Send className="w-3 h-3" />
                    <span>Publish Form Now</span>
                  </Button>
                </div>
              )}

              {/* Private preview link section */}
              <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#27272A] space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                  <Lock className="w-3 h-3 text-neutral-400" />
                  <span>Owner Preview</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <Link
                    href={`/forms/${formId}/preview`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsShareMenuOpen(false)}
                    className="text-neutral-700 dark:text-neutral-300 hover:text-[#563BFA] dark:hover:text-[#a594fd] flex items-center gap-1"
                  >
                    <span>View as respondent</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(previewUrl)}
                    className="text-[#563BFA] dark:text-[#a594fd] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy preview link</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Publish Button */}
        <Button
          type="button"
          size="sm"
          onClick={onPublishClick}
          disabled={isPublishing}
          className="gap-1.5 text-xs font-mono font-medium rounded-md h-7 px-3 bg-[#563BFA] hover:bg-[#4830d9] text-white shadow-none"
        >
          <Send className="w-3 h-3" />
          <span>Publish</span>
        </Button>

        {/* More Options Dropdown */}
        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
            className="w-7 h-7 rounded-md border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-[#181B20] transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-lg shadow-xl py-1 z-50 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onTabChange("settings");
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181B20]"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Form settings</span>
              </button>
              <Link
                href={`/forms/${formId}/preview`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181B20]"
                onClick={() => setIsMoreMenuOpen(false)}
              >
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                <span>Open preview in new tab</span>
              </Link>
              {isPublished && (
                <Link
                  href={`/f/${formId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181B20]"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Open public link</span>
                </Link>
              )}
              <div className="my-1 border-t border-[#E5E7EB] dark:border-[#27272A]" />
              <button
                type="button"
                onClick={() => router.push("/my-forms")}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit to My Forms</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
