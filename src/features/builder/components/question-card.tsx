"use client";

import React from "react";
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
          ? { ...opt, label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, "_") || opt.value }
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
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "w-full bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 shadow-xs relative group",
        isDragging && "opacity-50 ring-2 ring-violet-500 z-50",
        isSelected
          ? "border-violet-500/80 ring-2 ring-violet-500/20 shadow-md"
          : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
      )}
    >
      {/* Top Bar inside card: Drag handle + Question Number Badge + Move Buttons + Duplicate + Delete */}
      <div className="px-5 sm:px-6 pt-5 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Drag to reorder"
            aria-label="Drag handle"
          >
            <GripVertical className="w-4.5 h-4.5" />
          </button>

          {/* Question Number Badge */}
          <span className="text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-full border border-violet-100 dark:border-violet-900/30">
            Question {index + 1}
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
            placeholder="Untitled question"
            maxLength={300}
            className="flex-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-violet-500 focus:outline-none py-1.5 transition-all"
            aria-label="Question title"
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
        {question.description !== undefined && question.description !== null && (
          <input
            type="text"
            value={question.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Description / helper text (optional)"
            maxLength={500}
            className="w-full text-xs text-slate-500 dark:text-slate-400 placeholder:text-slate-400 bg-transparent border-0 border-b border-transparent focus:border-slate-300 focus:outline-none py-1"
            aria-label="Question helper text"
          />
        )}

        {/* Lightweight Interactive Question Respondent Preview */}
        <div className="pt-2">
          {question.type === "SHORT_TEXT" && (
            <div className="w-full sm:w-2/3 border-b-2 border-slate-200 dark:border-slate-700 py-2 text-xs text-slate-400 font-medium">
              Short answer text
            </div>
          )}

          {question.type === "LONG_TEXT" && (
            <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-400 font-medium">
              Paragraph answer text
            </div>
          )}

          {question.type === "EMAIL" && (
            <div className="w-full sm:w-2/3 border-b-2 border-slate-200 dark:border-slate-700 py-2 text-xs text-slate-400 font-medium">
              name@example.com
            </div>
          )}

          {question.type === "PHONE" && (
            <div className="w-full sm:w-2/3 border-b-2 border-slate-200 dark:border-slate-700 py-2 text-xs text-slate-400 font-medium">
              +1 (555) 000-0000
            </div>
          )}

          {question.type === "NUMBER" && (
            <div className="w-full sm:w-1/2 border-b-2 border-slate-200 dark:border-slate-700 py-2 text-xs text-slate-400 font-medium">
              Numeric value (e.g. 42)
            </div>
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
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 text-xs text-slate-700 dark:text-slate-200 bg-transparent border-0 border-b border-transparent focus:border-violet-400 focus:outline-none py-1"
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
            <div className="flex items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center"
                >
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400/40" />
                </div>
              ))}
              <span className="text-xs text-slate-400 ml-2">(1 to 5 scale)</span>
            </div>
          )}
        </div>

        {/* Bottom controls inside card: Required Toggle */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Required
            </span>
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600 relative" />
          </label>
        </div>
      </div>
    </div>
  );
}
