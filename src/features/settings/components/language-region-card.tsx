"use client";

import React from "react";
import { UserSettingsDTO, Locale } from "../schemas/settings-schema";
import { Globe, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageRegionCardProps {
  settings: UserSettingsDTO;
  onChange: <K extends keyof UserSettingsDTO>(key: K, value: UserSettingsDTO[K]) => void;
  className?: string;
}

export function LanguageRegionCard({
  settings,
  onChange,
  className,
}: LanguageRegionCardProps) {
  const timezones = [
    { value: "Asia/Kolkata", label: "(GMT+5:30) India Standard Time" },
    { value: "UTC", label: "(GMT+0:00) UTC" },
    { value: "Europe/London", label: "(GMT+0:00) London, Edinburgh" },
    { value: "Europe/Paris", label: "(GMT+1:00) Paris, Berlin, Rome" },
    { value: "America/New_York", label: "(GMT-5:00) Eastern Time (US & Canada)" },
    { value: "America/Chicago", label: "(GMT-6:00) Central Time (US & Canada)" },
    { value: "America/Denver", label: "(GMT-7:00) Mountain Time (US & Canada)" },
    { value: "America/Los_Angeles", label: "(GMT-8:00) Pacific Time (US & Canada)" },
    { value: "Asia/Tokyo", label: "(GMT+9:00) Tokyo, Osaka, Sapporo" },
    { value: "Australia/Sydney", label: "(GMT+10:00) Sydney, Melbourne" },
  ];

  const regions = [
    { value: "India", label: "India" },
    { value: "United States", label: "United States" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "Germany", label: "Germany" },
    { value: "Global", label: "Global / Other" },
  ];

  return (
    <div
      id="language-region-section"
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Language & Region
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Set your language, timezone and region preferences.
        </p>
      </div>

      <div className="space-y-4">
        {/* Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="language-select"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Language
              </label>
              <span className="text-[11px] text-slate-400 block">
                Primary display language for Formly.
              </span>
            </div>
          </div>
          <select
            id="language-select"
            value={settings.locale}
            onChange={(e) => onChange("locale", e.target.value as Locale)}
            className="w-full sm:w-48 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="en">English (US)</option>
            <option value="es" disabled>
              Español (Coming soon)
            </option>
            <option value="fr" disabled>
              Français (Coming soon)
            </option>
            <option value="de" disabled>
              Deutsch (Coming soon)
            </option>
            <option value="hi" disabled>
              हिन्दी (Coming soon)
            </option>
          </select>
        </div>

        {/* Timezone */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="timezone-select"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Timezone
              </label>
              <span className="text-[11px] text-slate-400 block">
                Used for timestamp formatting across forms.
              </span>
            </div>
          </div>
          <select
            id="timezone-select"
            value={settings.timeZone}
            onChange={(e) => onChange("timeZone", e.target.value)}
            className="w-full sm:w-48 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 truncate"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="region-select"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Region
              </label>
              <span className="text-[11px] text-slate-400 block">
                Your country or geographic territory.
              </span>
            </div>
          </div>
          <select
            id="region-select"
            value={settings.region}
            onChange={(e) => onChange("region", e.target.value)}
            className="w-full sm:w-48 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {regions.map((reg) => (
              <option key={reg.value} value={reg.value}>
                {reg.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
