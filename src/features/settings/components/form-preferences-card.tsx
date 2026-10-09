"use client";

import React from "react";
import {
  UserSettingsDTO,
  DefaultThemeId,
} from "../schemas/settings-schema";
import { Palette, BarChart3, Mail, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FormPreferencesCardProps {
  settings: UserSettingsDTO;
  onChange: <K extends keyof UserSettingsDTO>(key: K, value: UserSettingsDTO[K]) => void;
  className?: string;
}

export function FormPreferencesCard({
  settings,
  onChange,
  className,
}: FormPreferencesCardProps) {
  const themeOptions: { id: DefaultThemeId; label: string }[] = [
    { id: "soft-lavender", label: "Modern (Light)" },
    { id: "default", label: "Standard Formly" },
    { id: "education-soft", label: "Education Soft" },
    { id: "event-vibrant", label: "Event Vibrant" },
    { id: "feedback-mint", label: "Feedback Mint" },
    { id: "survey-purple", label: "Survey Purple" },
    { id: "business-amber", label: "Business Amber" },
    { id: "healthcare-rose", label: "Healthcare Rose" },
    { id: "community-indigo", label: "Community Indigo" },
  ];

  return (
    <div
      id="form-preferences-section"
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5",
        className
      )}
    >
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Form Preferences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Set default options for new forms you create.
        </p>
      </div>

      <div className="space-y-4">
        {/* Default Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <Palette className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <label
                htmlFor="default-theme"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 block"
              >
                Default Theme
              </label>
              <span className="text-[11px] text-slate-400 block">
                Choose a default theme for new forms.
              </span>
            </div>
          </div>
          <select
            id="default-theme"
            value={settings.defaultThemeId}
            onChange={(e) =>
              onChange("defaultThemeId", e.target.value as DefaultThemeId)
            }
            className="w-full sm:w-44 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {themeOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show Progress Indicator */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <BarChart3 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Show Progress Indicator
              </span>
              <span className="text-[11px] text-slate-400 block">
                Automatically enable progress bar for new forms.
              </span>
            </div>
          </div>
          <Switch
            checked={settings.showProgressIndicator}
            onCheckedChange={(checked) =>
              onChange("showProgressIndicator", checked)
            }
            aria-label="Toggle show progress indicator"
          />
        </div>

        {/* Collect Email Addresses */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Collect Email Addresses
              </span>
              <span className="text-[11px] text-slate-400 block">
                Enable by default for new forms.
              </span>
            </div>
          </div>
          <Switch
            checked={settings.collectEmailByDefault}
            onCheckedChange={(checked) =>
              onChange("collectEmailByDefault", checked)
            }
            aria-label="Toggle collect email addresses"
          />
        </div>

        {/* Allow Multiple Submissions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <RefreshCw className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Allow Multiple Submissions
              </span>
              <span className="text-[11px] text-slate-400 block">
                Allow respondents to submit multiple times by default.
              </span>
            </div>
          </div>
          <Switch
            checked={settings.allowMultipleSubmissions}
            onCheckedChange={(checked) =>
              onChange("allowMultipleSubmissions", checked)
            }
            aria-label="Toggle allow multiple submissions"
          />
        </div>
      </div>
    </div>
  );
}
