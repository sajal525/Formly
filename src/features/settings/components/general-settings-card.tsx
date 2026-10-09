"use client";

import React from "react";
import {
  UserSettingsDTO,
  LandingPage,
  FormView,
  ItemsPerPage,
  DateFormat,
  TimeFormat,
} from "../schemas/settings-schema";
import {
  LayoutDashboard,
  LayoutGrid,
  List,
  Layers,
  Calendar,
  Clock,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneralSettingsCardProps {
  settings: UserSettingsDTO;
  onChange: <K extends keyof UserSettingsDTO>(key: K, value: UserSettingsDTO[K]) => void;
  className?: string;
}

export function GeneralSettingsCard({
  settings,
  onChange,
  className,
}: GeneralSettingsCardProps) {
  return (
    <div
      id="general-section"
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          General Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your basic preferences for Formly.
        </p>
      </div>

      <div className="space-y-4">
        {/* Default Landing Page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="default-landing-page"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Default Landing Page
              </label>
              <span className="text-[11px] text-slate-400 block">
                Choose which page to open after login.
              </span>
            </div>
          </div>
          <select
            id="default-landing-page"
            value={settings.defaultLandingPage}
            onChange={(e) =>
              onChange("defaultLandingPage", e.target.value as LandingPage)
            }
            className="w-full sm:w-44 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="dashboard">Dashboard</option>
            <option value="my-forms">My Forms</option>
            <option value="templates">Templates</option>
            <option value="responses">Responses</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        {/* Default Form View */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <LayoutGrid className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Default Form View
              </span>
              <span className="text-[11px] text-slate-400 block">
                Choose how to view forms in My Forms.
              </span>
            </div>
          </div>
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => onChange("defaultFormView", "grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                settings.defaultFormView === "grid"
                  ? "bg-[#563BFA] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              type="button"
              onClick={() => onChange("defaultFormView", "list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                settings.defaultFormView === "list"
                  ? "bg-[#563BFA] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>

        {/* Items per Page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="items-per-page"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Items per Page
              </label>
              <span className="text-[11px] text-slate-400 block">
                Number of forms/responses to show per page.
              </span>
            </div>
          </div>
          <select
            id="items-per-page"
            value={settings.itemsPerPage}
            onChange={(e) =>
              onChange("itemsPerPage", parseInt(e.target.value, 10) as ItemsPerPage)
            }
            className="w-full sm:w-44 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="date-format"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Date Format
              </label>
              <span className="text-[11px] text-slate-400 block">
                Choose how dates are displayed.
              </span>
            </div>
          </div>
          <select
            id="date-format"
            value={settings.dateFormat}
            onChange={(e) =>
              onChange("dateFormat", e.target.value as DateFormat)
            }
            className="w-full sm:w-44 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="DD MMM YYYY">DD MMM YYYY (e.g. 09 Oct 2026)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Time Format */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="time-format"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Time Format
              </label>
              <span className="text-[11px] text-slate-400 block">
                Choose how time is displayed.
              </span>
            </div>
          </div>
          <select
            id="time-format"
            value={settings.timeFormat}
            onChange={(e) =>
              onChange("timeFormat", e.target.value as TimeFormat)
            }
            className="w-full sm:w-44 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="12h">12-hour (e.g. 10:30 AM)</option>
            <option value="24h">24-hour (e.g. 22:30)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
