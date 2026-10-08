"use client";

import React from "react";
import Link from "next/link";
import { FormlyLogo } from "@/components/branding/formly-logo";
import { ThemeToggle } from "@/components/branding/theme-toggle";

export function RegistrationHeader() {
  const navItems = ["Features", "Templates", "Pricing", "Help"];

  return (
    <header className="w-full px-4 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20 h-14 sm:h-16 flex items-center justify-between z-20 relative shrink-0">
      {/* Brand Logo */}
      <Link
        href="/"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#563BFA] rounded-xl"
      >
        <FormlyLogo size="md" />
      </Link>

      {/* Center Nav Links (Visible on Tablet/Desktop) */}
      <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-sm font-medium text-slate-600 dark:text-slate-300">
        {navItems.map((item) => (
          <span
            key={item}
            className="hover:text-[var(--ink)] cursor-pointer transition-colors"
            onClick={() => alert(`${item} page will be available soon.`)}
          >
            {item}
          </span>
        ))}
      </nav>

      {/* Right Controls: Theme Toggle & Sign-in Link */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account?</span>
          <Link
            href="/login"
            className="font-bold text-[#563BFA] dark:text-indigo-400 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
