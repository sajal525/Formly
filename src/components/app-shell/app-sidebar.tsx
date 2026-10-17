"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormlyLogo } from "@/components/branding/formly-logo";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  LineChart,
  User,
  Settings,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
  variant?: "default" | "minimal";
}

export function AppSidebar({ className, onNavigate, variant = "minimal" }: AppSidebarProps) {
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const currentPath = optimisticPath || pathname;

  const mainNav = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: currentPath === "/dashboard",
      comingSoon: false,
    },
    {
      title: "My Forms",
      href: "/my-forms",
      icon: FileText,
      active: currentPath === "/my-forms",
      comingSoon: false,
    },
    {
      title: "Responses",
      href: "/responses",
      icon: BarChart2,
      active: currentPath === "/responses",
      comingSoon: false,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: LineChart,
      active: currentPath === "/analytics",
      comingSoon: false,
    },
  ];

  const secondaryNav = [
    {
      title: "Profile",
      href: "/profile",
      icon: User,
      active: currentPath === "/profile",
      comingSoon: false,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      active: currentPath === "/settings",
      comingSoon: false,
    },
    {
      title: "Trash",
      href: "/trash",
      icon: Trash2,
      active: currentPath === "/trash",
      comingSoon: false,
    },
  ];

  if (variant === "minimal") {
    return (
      <aside
        className={cn(
          "w-16 shrink-0 h-full flex flex-col items-center bg-white dark:bg-zinc-950 border-r border-zinc-200/90 dark:border-zinc-800 select-none py-4 transition-colors z-40",
          className
        )}
      >
        {/* Brand Mark */}
        <div className="h-10 flex items-center justify-center mb-5">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 transition-colors"
            aria-label="Formly home"
          >
            <FormlyLogo size="sm" showWordmark={false} />
          </Link>
        </div>

        {/* Main Nav (Icons with Tooltips & Purple Active Connector) */}
        <nav className="flex flex-col items-center space-y-2 w-full px-2" aria-label="Main navigation">
          {mainNav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                prefetch={true}
                title={item.title}
                aria-label={item.title}
                onClick={() => {
                  setOptimisticPath(item.href);
                  onNavigate?.();
                }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
                  item.active
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <Icon className="w-5 h-5 stroke-[1.75]" />

                {/* Precise Purple Active Marker (Line + Dot touching right border) */}
                {item.active && (
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <span className="w-2 h-[2px] bg-purple-600 rounded-full" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 -ml-0.5" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Subtle Divider */}
        <div className="my-3.5 w-6 h-[1px] bg-zinc-200 dark:bg-zinc-800" />

        {/* Secondary Nav */}
        <nav className="flex flex-col items-center space-y-2 w-full px-2" aria-label="Secondary navigation">
          {secondaryNav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                prefetch={true}
                title={item.title}
                aria-label={item.title}
                onClick={() => {
                  setOptimisticPath(item.href);
                  onNavigate?.();
                }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
                  item.active
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <Icon className="w-5 h-5 stroke-[1.75]" />

                {item.active && (
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <span className="w-2 h-[2px] bg-purple-600 rounded-full" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 -ml-0.5" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Circular Dark Action Button */}
        <div className="mt-auto mb-1 flex items-center justify-center">
          <button
            type="button"
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center transition-opacity shadow-2xs"
            title="Formly"
            aria-label="Formly workspace"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-950" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "w-[244px] shrink-0 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/70 dark:border-white/10 select-none transition-colors duration-200",
        className
      )}
    >
      <div className="flex flex-col flex-1 p-5 overflow-y-auto">
        {/* Logo */}
        <div className="h-10 flex items-center mb-6 pl-1">
          <Link
            href="/dashboard"
            className="group inline-flex items-center h-10 px-2 -ml-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#563BFA] dark:focus-visible:ring-[#7C67FA] transition-colors"
            aria-label="Formly home"
          >
            <FormlyLogo size="md" expandOnHover />
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="space-y-1" aria-label="Main navigation">
          {mainNav.map((item) => {
            const Icon = item.icon;
            if (item.comingSoon) {
              return (
                <div
                  key={item.title}
                  className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  title="Feature coming soon"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  setOptimisticPath(item.href);
                  onNavigate?.();
                }}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all",
                  item.active
                    ? "bg-[#EEF0FF] dark:bg-indigo-950/70 text-[#563BFA] dark:text-indigo-400 font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      item.active
                        ? "text-[#563BFA] dark:text-indigo-400"
                        : "text-slate-400"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-5 border-t border-slate-200/70 dark:border-white/10" />

        {/* Secondary Nav */}
        <nav className="space-y-1" aria-label="Secondary navigation">
          {secondaryNav.map((item) => {
            const Icon = item.icon;

            if (item.comingSoon) {
              return (
                <div
                  key={item.title}
                  className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  title="Feature coming soon"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  setOptimisticPath(item.href);
                  onNavigate?.();
                }}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all",
                  item.active
                    ? "bg-[#EEF0FF] dark:bg-indigo-950/70 text-[#563BFA] dark:text-indigo-400 font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      item.active
                        ? "text-[#563BFA] dark:text-indigo-400"
                        : "text-slate-400"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
