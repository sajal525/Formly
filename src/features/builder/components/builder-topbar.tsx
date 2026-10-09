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
import { cn } from "@/lib/utils";

interface BuilderTopbarProps {
  formId: string;
  title: string;
  onTitleChange: (newTitle: string) => void;
  autosaveStatus: AutosaveStatus;
  lastSavedAt?: string;
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
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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
    <header className="h-[72px] shrink-0 border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between gap-3 select-none z-30 transition-colors">
      {/* Left side: Back button & editable title & autosave pill */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={() => router.push("/my-forms")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Back to My Forms"
          aria-label="Back to My Forms"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>

        {/* Editable Title */}
        <div className="flex items-center gap-2 max-w-[130px] sm:max-w-xs md:max-w-sm lg:max-w-md min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <input
                ref={titleInputRef}
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                maxLength={120}
                className="h-8 px-2.5 py-1 text-xs sm:text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-full min-w-0"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                title="Save title"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 sm:gap-2 text-left truncate rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors min-w-0"
              title="Click to edit form title"
            >
              <h1 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h1>
              <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 transition-colors shrink-0" />
            </button>
          )}
        </div>

        {/* Autosave status indicator badge */}
        <div className="hidden sm:block">
          <AutosaveIndicator status={autosaveStatus} lastSavedAt={lastSavedAt} />
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

        {/* Notifications & User Pill */}
        <div className="hidden lg:flex items-center gap-2 border-r border-slate-200 dark:border-white/10 pr-2 mr-1">
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
              {userInitial}
            </span>
            <span className="text-slate-700 dark:text-slate-200 max-w-[80px] truncate">
              {user?.displayName || user?.username || "Flash"}
            </span>
          </div>
        </div>

        {/* Share Button (matches B4.png) */}
        <div className="relative" ref={shareMenuRef}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsShareMenuOpen((prev) => !prev)}
            className="gap-2 text-xs font-semibold rounded-xl h-9 px-3 sm:px-4 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Share2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {isShareMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                <span className="font-bold text-slate-900 dark:text-white">Share Form</span>
                {isPublished ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Live
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    Draft
                  </span>
                )}
              </div>

              {isPublished ? (
                /* Published Link */
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Public Respondent URL
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="flex-1 h-8.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-mono select-all focus:outline-none truncate"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCopyLink(publicUrl)}
                      className="h-8.5 px-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-1 shrink-0"
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
                      className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                    >
                      <span>Open in new tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Draft Notice */
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    This form is currently a draft. Publish to generate an active public link for respondents.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsShareMenuOpen(false);
                      onPublishClick();
                    }}
                    className="w-full h-8.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Form Now</span>
                  </Button>
                </div>
              )}

              {/* Private preview link section */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Owner Preview</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <Link
                    href={`/forms/${formId}/preview`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsShareMenuOpen(false)}
                    className="text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 flex items-center gap-1"
                  >
                    <span>View as respondent</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(previewUrl)}
                    className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy preview link</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Publish Button (matches B4.png) */}
        <Button
          type="button"
          size="sm"
          onClick={onPublishClick}
          disabled={isPublishing}
          className="gap-2 text-xs font-bold rounded-xl h-9 px-3.5 sm:px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shadow-violet-500/20 active:scale-[0.98] transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Publish</span>
        </Button>

        {/* More Options Dropdown */}
        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl py-1.5 z-50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onTabChange("settings");
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                <span>Form settings</span>
              </button>
              <Link
                href={`/forms/${formId}/preview`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsMoreMenuOpen(false)}
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Open preview in new tab</span>
              </Link>
              {isPublished && (
                <Link
                  href={`/f/${formId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Open public link</span>
                </Link>
              )}
              <div className="my-1 border-t border-slate-100 dark:border-white/5" />
              <button
                type="button"
                onClick={() => router.push("/my-forms")}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit to My Forms</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
