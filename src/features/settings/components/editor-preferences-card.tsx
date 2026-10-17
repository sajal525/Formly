"use client";

import React from "react";
import {
  UserSettingsDTO,
  DefaultQuestionType,
} from "../schemas/settings-schema";
import { Save, Command, HelpCircle, Hash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface EditorPreferencesCardProps {
  settings: UserSettingsDTO;
  onChange: <K extends keyof UserSettingsDTO>(key: K, value: UserSettingsDTO[K]) => void;
  className?: string;
}

export function EditorPreferencesCard({
  settings,
  onChange,
  className,
}: EditorPreferencesCardProps) {
  const questionTypeOptions: { id: DefaultQuestionType; label: string }[] = [
    { id: "SHORT_TEXT", label: "Short Answer" },
    { id: "LONG_TEXT", label: "Long Text" },
    { id: "MULTIPLE_CHOICE", label: "Multiple Choice" },
    { id: "CHECKBOX", label: "Checkbox" },
    { id: "DROPDOWN", label: "Dropdown" },
    { id: "DATE", label: "Date" },
    { id: "RATING", label: "Rating" },
    { id: "EMAIL", label: "Email" },
    { id: "PHONE", label: "Phone" },
    { id: "NUMBER", label: "Number" },
  ];

  return (
    <div
      id="editor-preferences-section"
      className={cn(
        "bg-white dark:bg-[#121417] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl p-5 space-y-5",
        className
      )}
    >
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold mb-1">
          Preferences // Editor
        </div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Editor Preferences
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Customize your form builder experience.
        </p>
      </div>

      <div className="space-y-4">
        {/* Auto-save Forms */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#E5E7EB] dark:border-[#27272A]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <Save className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
                Auto-save Forms
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
                Automatically save changes while editing.
              </span>
            </div>
          </div>
          <Switch
            checked={settings.autoSaveForms}
            onCheckedChange={(checked) => onChange("autoSaveForms", checked)}
            aria-label="Toggle auto-save forms"
          />
        </div>

        {/* Show Keyboard Shortcuts */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#E5E7EB] dark:border-[#27272A]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <Command className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
                Show Keyboard Shortcuts
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
                Display keyboard shortcut hints in the editor.
              </span>
            </div>
          </div>
          <Switch
            checked={settings.showKeyboardShortcuts}
            onCheckedChange={(checked) =>
              onChange("showKeyboardShortcuts", checked)
            }
            aria-label="Toggle keyboard shortcuts hints"
          />
        </div>

        {/* Default Question Type */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-[#E5E7EB] dark:border-[#27272A]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <label
                htmlFor="default-question-type"
                className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block"
              >
                Default Question Type
              </label>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
                Default question type when adding a new question.
              </span>
            </div>
          </div>
          <select
            id="default-question-type"
            value={settings.defaultQuestionType}
            onChange={(e) =>
              onChange("defaultQuestionType", e.target.value as DefaultQuestionType)
            }
            className="w-full sm:w-44 text-xs font-mono rounded-lg border border-[#E5E7EB] dark:border-[#27272A] bg-neutral-50 dark:bg-[#181B20] text-neutral-900 dark:text-neutral-100 py-1.5 px-3 focus:outline-none focus:border-[#563BFA]"
          >
            {questionTypeOptions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show Question Numbers */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#181B20] border border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
              <Hash className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
                Show Question Numbers
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-mono">
                Automatically number questions.
              </span>
            </div>
          </div>
          <Switch
            checked={settings.showQuestionNumbers}
            onCheckedChange={(checked) =>
              onChange("showQuestionNumbers", checked)
            }
            aria-label="Toggle show question numbers"
          />
        </div>
      </div>
    </div>
  );
}
