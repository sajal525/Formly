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
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-5 space-y-5",
        className
      )}
    >
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold mb-1">
          Preferences // Forms
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Form Preferences
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Set default options for new forms you create.
        </p>
      </div>

      <div className="space-y-4">
        {/* Default Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-[#E5E7EB] dark:border-[#27272A]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <Palette className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <label
                htmlFor="default-theme"
                className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block"
              >
                Default Theme
              </label>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
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
            className="w-full sm:w-44 text-xs font-mono rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-50 dark:bg-[#181B20] text-neutral-900 dark:text-neutral-100 py-1.5 px-3 focus:outline-none focus:border-[#563BFA]"
          >
            {themeOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show Progress Indicator */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#E5E7EB] dark:border-[#27272A]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <BarChart3 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
                Show Progress Indicator
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
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
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#E5E7EB] dark:border-[#27272A]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
                Collect Email Addresses
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
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
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
                Allow Multiple Submissions
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
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
