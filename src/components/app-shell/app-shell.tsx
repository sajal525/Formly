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
  };
  children: React.ReactNode;
  mainClassName?: string;
}

export function AppShell({ user, children, mainClassName }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex w-full bg-[var(--page-bg)] text-[var(--body-text)] transition-colors duration-200">
      {/* Desktop Sidebar (hidden on mobile, visible on lg) */}
      <div className="hidden lg:block h-full shrink-0 z-40">
        <AppSidebar />
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
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main
          className={cn(
            "flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 overflow-y-auto flex flex-col min-h-0",
            mainClassName
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
