"use client";

import React from "react";
import { Settings } from "lucide-react";
import {
  FormSettings,
  FormCategory,
  FormLanguage,
  formCategorySchema,
  formLanguageSchema,
} from "../../schemas/builder-definition-schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GeneralSettingsCardProps {
  title: string;
  description?: string | null;
  settings: FormSettings;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

const CATEGORIES: FormCategory[] = [
  "Education",
  "Feedback",
  "Registration",
  "Business",
  "Event",
  "Survey",
  "Other",
];

const LANGUAGES: FormLanguage[] = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Japanese",
  "Other",
];

export function GeneralSettingsCard({
  title,
  description,
  settings,
  onTitleChange,
  onDescriptionChange,
  onSettingsChange,
}: GeneralSettingsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            General Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Basic information and general preferences for your form.
          </p>
        </div>
      </div>

      {/* Form Title */}
      <div className="space-y-1.5">
        <label
          htmlFor="settings-form-title"
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
        >
          Form Title
        </label>
        <Input
          id="settings-form-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled form"
          className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Form Description */}
      <div className="space-y-1.5">
        <label
          htmlFor="settings-form-description"
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
        >
          Form Description (Optional)
        </label>
        <Textarea
          id="settings-form-description"
          value={description || ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Give your respondents context or instructions..."
          rows={2}
          className="text-xs rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none"
        />
      </div>

      {/* Category & Language Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <label
            htmlFor="settings-form-category"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
          >
            Form Category
          </label>
          <select
            id="settings-form-category"
            value={settings.category || "Education"}
            onChange={(e) =>
              onSettingsChange({ category: e.target.value as FormCategory })
            }
            className="w-full h-9 px-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="settings-form-language"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
          >
            Default Language
          </label>
          <select
            id="settings-form-language"
            value={settings.defaultLanguage || "English"}
            onChange={(e) =>
              onSettingsChange({ defaultLanguage: e.target.value as FormLanguage })
            }
            className="w-full h-9 px-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
