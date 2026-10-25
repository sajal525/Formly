"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Star,
  Check,
  AlignLeft,
  Type,
  List,
  CheckSquare,
  ChevronDownSquare,
  Mail,
  Hash,
  Phone,
  Calendar,
} from "lucide-react";
import {
  BuilderQuestion,
  BuilderQuestionType,
  QuestionOption,
} from "../schemas/builder-definition-schema";
import { getDefaultTextSelectProps } from "../utils/default-text-select";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: BuilderQuestion;
  index: number;
  totalQuestions: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<BuilderQuestion>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const QUESTION_TYPES: {
  value: BuilderQuestionType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "SHORT_TEXT", label: "Short answer", icon: Type },
  { value: "LONG_TEXT", label: "Paragraph", icon: AlignLeft },
  { value: "MULTIPLE_CHOICE", label: "Multiple choice", icon: List },
  { value: "CHECKBOX", label: "Checkboxes", icon: CheckSquare },
  { value: "DROPDOWN", label: "Dropdown", icon: ChevronDownSquare },
  { value: "RATING", label: "Rating", icon: Star },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "NUMBER", label: "Number", icon: Hash },
  { value: "PHONE", label: "Phone", icon: Phone },
  { value: "DATE", label: "Date", icon: Calendar },
];

export function QuestionCard({
  question,
  index,
  totalQuestions,
  isSelected,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuestionCardProps) {
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasDescription =
    question.description !== null && question.description !== undefined;
  const isTextType = [
    "SHORT_TEXT",
    "LONG_TEXT",
    "EMAIL",
    "PHONE",
    "NUMBER",
  ].includes(question.type);

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
          minLength: current.minLength || 5,
          maxLength: undefined,
        },
      });
    } else if (mode === "MAX") {
      onChange({
        settings: {
          ...current,
          minLength: undefined,
          maxLength: current.maxLength || 100,
        },
      });
    }
  };

  const handleTypeChange = (newType: BuilderQuestionType) => {
    const updates: Partial<BuilderQuestion> = { type: newType };
    if (
      ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(newType) &&
      (!question.options || question.options.length === 0)
    ) {
      updates.options = [
        { id: `opt-${Date.now()}-1`, label: "Option 1", value: "option_1" },
        { id: `opt-${Date.now()}-2`, label: "Option 2", value: "option_2" },
      ];
    }
    onChange(updates);
  };

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const nextIdx = currentOptions.length + 1;
    const newOpt: QuestionOption = {
      id: `opt-${Date.now()}`,
      label: `Option ${nextIdx}`,
      value: `option_${nextIdx}`,
    };
    onChange({ options: [...currentOptions, newOpt] });
  };

  const handleUpdateOption = (optId: string, newLabel: string) => {
    const currentOptions = question.options || [];
    onChange({
      options: currentOptions.map((opt) =>
        opt.id === optId
          ? {
              ...opt,
              label: newLabel,
              value: newLabel.toLowerCase().replace(/\s+/g, "_") || opt.value,
            }
          : opt
      ),
    });
  };

  const handleRemoveOption = (optId: string) => {
    const currentOptions = question.options || [];
    if (currentOptions.length <= 1) return;
    onChange({ options: currentOptions.filter((opt) => opt.id !== optId) });
  };

  return (
    <div
      id={`question-card-${question.id}`}
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "w-full bg-white dark:bg-[#121417] rounded-xl border transition-all duration-150 relative group",
        isDragging && "opacity-50 ring-1 ring-[#563BFA] z-50",
        isSelected
          ? "border-[#563BFA] ring-1 ring-[#563BFA]/30"
          : "border-[#E5E7EB] dark:border-[#27272A] hover:border-neutral-300 dark:hover:border-neutral-700"
      )}
    >
      {/* Top Bar inside card: Drag handle + Question Number Badge + Move Buttons + Duplicate + Delete */}
      <div className="px-4 sm:px-5 pt-3.5 pb-2 flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#27272A]">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-grab active:cursor-grabbing hover:bg-neutral-100 dark:hover:bg-[#181B20] transition-colors"
            title="Drag to reorder"
            aria-label="Drag handle"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Question Number Badge */}
          <span className="text-[10px] font-mono uppercase font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-[#181B20] px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#27272A]">
            Q{index + 1}
          </span>
        </div>

        {/* Action icons: Move Up, Move Down, Duplicate, Delete */}
        <div className="flex items-center gap-1">
          {/* Accessible Move Up Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              index === 0
                ? "text-slate-200 dark:text-slate-700 cursor-not-allowed"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title="Move question up"
            aria-label={`Move question ${index + 1} up`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Accessible Move Down Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalQuestions - 1}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              index === totalQuestions - 1
                ? "text-slate-200 dark:text-slate-700 cursor-not-allowed"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            title="Move question down"
            aria-label={`Move question ${index + 1} down`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1" />

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Duplicate question"
            aria-label="Duplicate question"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete question"
            aria-label="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Row: Question Title & Type Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <input
            type="text"
            value={question.label}
            onChange={(e) => onChange({ label: e.target.value })}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                e.stopPropagation();
                e.currentTarget.select();
              }
            }}
            placeholder="Untitled question"
            maxLength={300}
            className="flex-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-violet-500 focus:outline-none py-1.5 transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
            aria-label="Question title"
            {...getDefaultTextSelectProps("Untitled question", {
              onBlur: () => {
                if (!question.label || !question.label.trim()) {
                  onChange({ label: "Untitled question" });
                }
              },
            })}
          />

          {/* Question Type Selector */}
          <div className="shrink-0">
            <select
              value={question.type}
              onChange={(e) => handleTypeChange(e.target.value as BuilderQuestionType)}
              className="h-9 px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
              aria-label="Question type"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Question Description (if present) */}
        {hasDescription ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={question.description || ""}
              onChange={(e) => onChange({ description: e.target.value })}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
              placeholder="Description / helper text (optional)"
              maxLength={500}
              className="flex-1 text-xs text-slate-500 dark:text-slate-400 placeholder:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600 focus:outline-none py-1 transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
              aria-label="Question helper text"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ description: null });
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title="Remove description"
              aria-label="Remove description"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ description: "" });
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add description</span>
            </button>
          </div>
        )}

        {/* Lightweight Interactive Question Respondent Preview & Placeholder Editor */}
        <div className="pt-2">
          {question.type === "SHORT_TEXT" && (
            <input
              type="text"
              value={question.settings?.placeholder ?? ""}
              onChange={(e) =>
                onChange({
                  settings: {
                    ...(question.settings || {}),
                    placeholder: e.target.value,
                  },
                })
              }
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
              placeholder="Short answer text"
              className="w-full sm:w-2/3 border-b-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
              aria-label="Short answer placeholder"
            />
          )}

          {question.type === "LONG_TEXT" && (
            <textarea
              rows={2}
              value={question.settings?.placeholder ?? ""}
              onChange={(e) =>
                onChange({
                  settings: {
                    ...(question.settings || {}),
                    placeholder: e.target.value,
                  },
                })
              }
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
              placeholder="Paragraph answer text"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 focus:border-violet-500 p-2.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none resize-none transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
              aria-label="Paragraph placeholder"
            />
          )}

          {question.type === "EMAIL" && (
            <input
              type="text"
              value={question.settings?.placeholder ?? ""}
              onChange={(e) =>
                onChange({
                  settings: {
                    ...(question.settings || {}),
                    placeholder: e.target.value,
                  },
                })
              }
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
              placeholder="name@example.com"
              className="w-full sm:w-2/3 border-b-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
              aria-label="Email placeholder"
            />
          )}

          {question.type === "PHONE" && (
            <input
              type="text"
              value={question.settings?.placeholder ?? ""}
              onChange={(e) =>
                onChange({
                  settings: {
                    ...(question.settings || {}),
                    placeholder: e.target.value,
                  },
                })
              }
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
              placeholder="+1 (555) 000-0000"
              className="w-full sm:w-2/3 border-b-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
              aria-label="Phone placeholder"
            />
          )}

          {question.type === "NUMBER" && (
            <input
              type="text"
              value={question.settings?.placeholder ?? ""}
              onChange={(e) =>
                onChange({
                  settings: {
                    ...(question.settings || {}),
                    placeholder: e.target.value,
                  },
                })
              }
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
              placeholder="Numeric value (e.g. 42)"
              className="w-full sm:w-1/2 border-b-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
              aria-label="Number placeholder"
            />
          )}

          {question.type === "DATE" && (
            <div className="w-full sm:w-1/2 border-b-2 border-slate-200 dark:border-slate-700 py-2 text-xs text-slate-400 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>dd / mm / yyyy</span>
            </div>
          )}

          {(question.type === "MULTIPLE_CHOICE" ||
            question.type === "CHECKBOX" ||
            question.type === "DROPDOWN") && (
            <div className="space-y-2">
              {(question.options || []).map((opt, i) => (
                <div key={opt.id || i} className="flex items-center gap-2.5">
                  {question.type === "MULTIPLE_CHOICE" && (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  {question.type === "CHECKBOX" && (
                    <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  {question.type === "DROPDOWN" && (
                    <span className="text-xs text-slate-400 font-mono w-4">{i + 1}.</span>
                  )}

                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                        e.stopPropagation();
                        e.currentTarget.select();
                      }
                    }}
                    placeholder={`Option ${i + 1}`}
                    {...getDefaultTextSelectProps(/^option\s+\d+$/i)}
                    className="flex-1 text-xs text-slate-700 dark:text-slate-200 bg-transparent border-0 border-b border-transparent focus:border-violet-400 focus:outline-none py-1 transition-colors selection:bg-[#563BFA]/20 selection:text-[#563BFA]"
                  />

                  {(question.options || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove option"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddOption}
                className="mt-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1.5 py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add option</span>
              </button>
            </div>
          )}

          {question.type === "RATING" && (
            <div className="flex items-center gap-2 py-1 flex-wrap">
              {Array.from(
                { length: question.settings?.maxRating || 5 },
                (_, i) => i + 1
              ).map((star) => (
                <div
                  key={star}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center"
                >
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400/40" />
                </div>
              ))}
              <span className="text-xs text-slate-400 ml-2">
                (1 to {question.settings?.maxRating || 5} scale)
              </span>
            </div>
          )}
        </div>

        {/* Bottom controls inside card: More Options toggle + Required Toggle */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
          {/* More options button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreOptionsOpen((prev) => !prev);
            }}
            aria-expanded={isMoreOptionsOpen}
            aria-controls={`more-options-${question.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              isMoreOptionsOpen
                ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <span>More options</span>
            {isMoreOptionsOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Required Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Required
            </span>
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="sr-only peer"
              aria-label="Required question"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600 relative" />
          </label>
        </div>

        {/* Inline Expandable More Options Area */}
        {isMoreOptionsOpen && (
          <div
            id={`more-options-${question.id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 space-y-3.5 animate-in fade-in-50 duration-150"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Question Configuration
              </span>
            </div>

            {/* Description toggle */}
            <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Add description
                </span>
                <span className="text-[11px] text-slate-400">
                  Show helper text under title
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasDescription}
                  onChange={(e) =>
                    onChange({
                      description: e.target.checked ? "" : null,
                    })
                  }
                  className="sr-only peer"
                  aria-label="Toggle description"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600" />
              </label>
            </div>

            {/* Placeholder Text (for text types) */}
            {isTextType && (
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1.5">
                <label
                  htmlFor={`panel-placeholder-${question.id}`}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Placeholder text
                </label>
                <input
                  id={`panel-placeholder-${question.id}`}
                  type="text"
                  value={question.settings?.placeholder ?? ""}
                  onChange={(e) =>
                    onChange({
                      settings: {
                        ...(question.settings || {}),
                        placeholder: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Type your answer here..."
                  maxLength={200}
                  className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            )}

            {/* Response Validation (for text types) */}
            {isTextType && (
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Response validation
                </span>

                {/* Text Length Mode */}
                <div>
                  <label
                    htmlFor={`length-mode-${question.id}`}
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Text length
                  </label>
                  <select
                    id={`length-mode-${question.id}`}
                    value={textLengthSetting()}
                    onChange={(e) => handleLengthModeChange(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="NONE">No limit</option>
                    <option value="MIN">Minimum character count</option>
                    <option value="MAX">Maximum character count</option>
                  </select>
                </div>

                {textLengthSetting() === "MIN" && (
                  <div>
                    <label
                      htmlFor={`min-len-${question.id}`}
                      className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                    >
                      Minimum characters
                    </label>
                    <input
                      id={`min-len-${question.id}`}
                      type="number"
                      min={1}
                      max={5000}
                      value={question.settings?.minLength || 5}
                      onChange={(e) =>
                        onChange({
                          settings: {
                            ...question.settings,
                            minLength: parseInt(e.target.value, 10) || 1,
                          },
                        })
                      }
                      className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                )}

                {textLengthSetting() === "MAX" && (
                  <div>
                    <label
                      htmlFor={`max-len-${question.id}`}
                      className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                    >
                      Maximum characters
                    </label>
                    <input
                      id={`max-len-${question.id}`}
                      type="number"
                      min={1}
                      max={5000}
                      value={question.settings?.maxLength || 100}
                      onChange={(e) =>
                        onChange({
                          settings: {
                            ...question.settings,
                            maxLength: parseInt(e.target.value, 10) || 100,
                          },
                        })
                      }
                      className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                )}

                {/* Pattern */}
                <div>
                  <label
                    htmlFor={`pattern-${question.id}`}
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Pattern
                  </label>
                  <input
                    id={`pattern-${question.id}`}
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
                    className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Custom Error Message */}
                <div>
                  <label
                    htmlFor={`custom-err-${question.id}`}
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Custom error message
                  </label>
                  <input
                    id={`custom-err-${question.id}`}
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
                    className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Rating Settings (for RATING type) */}
            {question.type === "RATING" && (
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Rating scale
                </span>
                <div>
                  <label
                    htmlFor={`rating-scale-${question.id}`}
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Maximum rating
                  </label>
                  <select
                    id={`rating-scale-${question.id}`}
                    value={question.settings?.maxRating || 5}
                    onChange={(e) =>
                      onChange({
                        settings: {
                          ...question.settings,
                          maxRating: parseInt(e.target.value, 10) || 5,
                        },
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value={3}>3 stars</option>
                    <option value={5}>5 stars (Default)</option>
                    <option value={7}>7 stars</option>
                    <option value={10}>10 stars</option>
                  </select>
                </div>
              </div>
            )}

            {/* Conditional Logic Note */}
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                Conditional logic
              </span>
              <p className="text-[11px] leading-relaxed">
                Branching rules will be available when the conditional logic engine is fully integrated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
