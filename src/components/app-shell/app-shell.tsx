"use client";

import React, { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  children: React.ReactNode;
  mainClassName?: string;
  variant?: "default" | "minimal";
}

export function AppShell({
  user,
  children,
  mainClassName,
  variant = "minimal",
}: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMinimal = variant === "minimal";

  return (
    <div
      className={cn(
        "min-h-screen lg:h-screen lg:overflow-hidden flex w-full transition-colors duration-200",
        isMinimal
          ? "bg-[#FAFAFA] dark:bg-[#090A0B] text-zinc-900 dark:text-zinc-100"
          : "bg-[var(--page-bg)] text-[var(--body-text)]"
      )}
    >
      {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
      <div className="hidden lg:block h-full shrink-0 z-40">
        <AppSidebar variant={variant} />
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppTopbar
          user={user}
          variant={variant}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main
          className={cn(
            "flex-1 w-full overflow-y-auto flex flex-col min-h-0",
            isMinimal
              ? "px-4 sm:px-6 md:px-8 lg:px-8 py-4 sm:py-5"
              : "px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6",
            mainClassName
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
