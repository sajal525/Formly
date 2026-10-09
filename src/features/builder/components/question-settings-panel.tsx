"use client";

import React, { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  BuilderQuestion,
  BuilderQuestionType,
} from "../schemas/builder-definition-schema";
import { QUESTION_TYPES } from "./question-card";
import { cn } from "@/lib/utils";

interface QuestionSettingsPanelProps {
  question: BuilderQuestion | null;
  onClose: () => void;
  onChange: (updates: Partial<BuilderQuestion>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function QuestionSettingsPanel({
  question,
  onClose,
  onChange,
  onDuplicate,
  onDelete,
}: QuestionSettingsPanelProps) {
  const [isValidationOpen, setIsValidationOpen] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isLogicOpen, setIsLogicOpen] = useState(false);

  if (!question) {
    return (
      <aside
        className="w-full lg:w-[340px] xl:w-[360px] bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-white/10 p-6 flex flex-col items-center justify-center text-center text-slate-400 select-none shrink-0"
        aria-label="Question settings"
      >
        <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Select a question
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
          Click on any question card on the canvas to configure its properties here.
        </p>
      </aside>
    );
  }

  const hasDescription =
    question.description !== null && question.description !== undefined;

  const textLengthSetting = () => {
    if (question.settings?.minLength) return "MIN";
    if (question.settings?.maxLength) return "MAX";
    return "NONE";
  };

  const handleLengthModeChange = (mode: string) => {
    const current = question.settings || {};
    if (mode === "NONE") {
      onChange({
        settings: {
          ...current,
          minLength: undefined,
          maxLength: undefined,
        },
      });
    } else if (mode === "MIN") {
      onChange({
        settings: {
          ...current,
          minLength: 5,
          maxLength: undefined,
        },
      });
    } else if (mode === "MAX") {
      onChange({
        settings: {
          ...current,
          minLength: undefined,
          maxLength: 100,
        },
      });
    }
  };

  return (
    <aside
      className="w-full lg:w-[340px] xl:w-[360px] bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-white/10 flex flex-col h-full overflow-y-auto select-none shrink-0"
      aria-label="Question settings panel"
    >
      {/* Header */}
      <div className="h-14 px-6 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Question settings
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close panel"
          aria-label="Close question settings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Settings Form */}
      <div className="p-6 space-y-5 flex-1">
        {/* Question Title */}
        <div>
          <label
            htmlFor="panel-question-title"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Question title
          </label>
          <input
            id="panel-question-title"
            type="text"
            value={question.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Untitled question"
            maxLength={300}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {/* Question Type */}
        <div>
          <label
            htmlFor="panel-question-type"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Question type
          </label>
          <select
            id="panel-question-type"
            value={question.type}
            onChange={(e) =>
              onChange({ type: e.target.value as BuilderQuestionType })
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-white/5">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Required question
            </span>
            <span className="text-[11px] text-slate-400">
              Must be answered to submit
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600" />
          </label>
        </div>

        {/* Add Description Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-white/5">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Add description
            </span>
            <span className="text-[11px] text-slate-400">
              Show helper text under title
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasDescription}
              onChange={(e) =>
                onChange({
                  description: e.target.checked ? "" : null,
                })
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600" />
          </label>
        </div>

        {/* Response Validation Accordion */}
        <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsValidationOpen((prev) => !prev)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Response validation</span>
            {isValidationOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isValidationOpen && (
            <div className="p-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
              {/* Text Length */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Text length
                </label>
                <select
                  value={textLengthSetting()}
                  onChange={(e) => handleLengthModeChange(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="NONE">No limit</option>
                  <option value="MIN">Minimum character count</option>
                  <option value="MAX">Maximum character count</option>
                </select>
              </div>

              {textLengthSetting() === "MIN" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Minimum characters
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={question.settings?.minLength || 5}
                    onChange={(e) =>
                      onChange({
                        settings: {
                          ...question.settings,
                          minLength: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              )}

              {textLengthSetting() === "MAX" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Maximum characters
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={question.settings?.maxLength || 100}
                    onChange={(e) =>
                      onChange({
                        settings: {
                          ...question.settings,
                          maxLength: parseInt(e.target.value) || 100,
                        },
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              )}

              {/* Pattern */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pattern
                </label>
                <input
                  type="text"
                  placeholder="e.g. [0-9]+"
                  value={question.settings?.pattern || ""}
                  onChange={(e) =>
                    onChange({
                      settings: {
                        ...question.settings,
                        pattern: e.target.value,
                      },
                    })
                  }
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Custom Error Message */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Custom error message
                </label>
                <input
                  type="text"
                  placeholder="Enter error message"
                  value={question.settings?.customErrorMessage || ""}
                  onChange={(e) =>
                    onChange({
                      settings: {
                        ...question.settings,
                        customErrorMessage: e.target.value,
                      },
                    })
                  }
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Advanced Settings Accordion */}
        <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen((prev) => !prev)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Advanced settings</span>
            {isAdvancedOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {isAdvancedOpen && (
            <div className="p-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 space-y-2">
              <p>Placeholder configuration:</p>
              <input
                type="text"
                placeholder="Custom input placeholder..."
                value={question.settings?.placeholder || ""}
                onChange={(e) =>
                  onChange({
                    settings: {
                      ...question.settings,
                      placeholder: e.target.value,
                    },
                  })
                }
                className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Conditional Logic Accordion */}
        <div className="border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsLogicOpen((prev) => !prev)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Conditional logic</span>
            {isLogicOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {isLogicOpen && (
            <div className="p-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
              <p className="leading-relaxed">
                Branching rules will be available when the conditional logic engine is fully integrated.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons (Duplicate, Delete) */}
      <div className="p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 shrink-0">
        <button
          type="button"
          onClick={onDuplicate}
          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate question</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="w-full h-9 px-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete question</span>
        </button>
      </div>
    </aside>
  );
}
