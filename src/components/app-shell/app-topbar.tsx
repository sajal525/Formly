"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/branding/theme-toggle";
import { authClient } from "@/lib/auth-client";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface AppTopbarProps {
  user: {
    id: string;
    username: string;
    displayName: string;
  };
  onOpenMobileMenu?: () => void;
}

export function AppTopbar({ user, onOpenMobileMenu }: AppTopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.href = "/login";
    }
  }

  const initial = (user.displayName || user.username || "U")[0]?.toUpperCase() || "U";

  return (
    <header className="h-[72px] shrink-0 w-full px-4 sm:px-6 md:px-8 border-b border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Left: Mobile Toggle + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search your forms, templates..."
            title="Search will be available in future releases"
            className="w-full h-10 pl-10 pr-12 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 cursor-not-allowed focus:outline-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-white/10 text-[10px] font-mono text-slate-400 shadow-2xs">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle + Bell + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* Notifications */}
        <button
          type="button"
          disabled
          title="No new notifications"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200/60 dark:hover:border-white/5 transition-all"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#329CF5] to-[#563BFA] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {initial}
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate hidden md:inline">
              {user.displayName || user.username}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.displayName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  @{user.username}
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Neon DB Connected</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
