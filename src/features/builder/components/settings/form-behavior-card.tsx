"use client";

import React from "react";
import { Sliders, CheckSquare, Shuffle, ListOrdered, FileSpreadsheet } from "lucide-react";
import { FormSettings } from "../../schemas/builder-definition-schema";
import { Switch } from "@/components/ui/switch";

interface FormBehaviorCardProps {
  settings: FormSettings;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

export function FormBehaviorCard({
  settings,
  onSettingsChange,
}: FormBehaviorCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Form Behavior
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize how the form behaves for respondents.
          </p>
        </div>
      </div>

      {/* Toggles list */}
      <div className="space-y-3.5 pt-1">
        {/* Show progress indicator */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-progress-indicator"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Show progress indicator
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Display completion progress at the top.
            </p>
          </div>
          <Switch
            id="toggle-progress-indicator"
            checked={settings.showProgressIndicator}
            onCheckedChange={(checked) =>
              onSettingsChange({ showProgressIndicator: checked })
            }
          />
        </div>

        {/* Shuffle question order */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-shuffle-questions"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Shuffle question order
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Show questions in random order.
            </p>
          </div>
          <Switch
            id="toggle-shuffle-questions"
            checked={settings.shuffleQuestionOrder}
            onCheckedChange={(checked) =>
              onSettingsChange({ shuffleQuestionOrder: checked })
            }
          />
        </div>

        {/* Show question numbers */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-question-numbers"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Show question numbers
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Display numbers for each question.
            </p>
          </div>
          <Switch
            id="toggle-question-numbers"
            checked={settings.showQuestionNumbers}
            onCheckedChange={(checked) =>
              onSettingsChange({ showQuestionNumbers: checked })
            }
          />
        </div>

        {/* One question per page */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label
                htmlFor="toggle-one-per-page"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                One question per page
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Show one question at a time instead of all.
            </p>
          </div>
          <Switch
            id="toggle-one-per-page"
            checked={settings.oneQuestionPerPage}
            onCheckedChange={(checked) =>
              onSettingsChange({ oneQuestionPerPage: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
