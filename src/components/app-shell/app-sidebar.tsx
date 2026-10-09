"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormlyLogo } from "@/components/branding/formly-logo";
import {
  LayoutDashboard,
  FileText,
  LayoutGrid,
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
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
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
      title: "Templates",
      href: "/templates",
      icon: LayoutGrid,
      active: currentPath === "/templates",
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
          <Link href="/dashboard" className="flex items-center gap-2">
            <FormlyLogo size="md" />
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
