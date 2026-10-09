"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  ListFilter,
  Type,
  Mail,
  Phone,
  Hash,
  CheckSquare,
  ChevronDownSquare,
  Calendar,
  Star,
  AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateCardDTO } from "../server/get-template-catalog";
import { TemplatePreviewDTO } from "../server/get-template-preview";
import { TemplatePreviewVisual } from "./template-preview-visual";
import { categoryLabels, TemplateCategoryKey } from "../schemas/template-query-schema";
import { QuestionType } from "../data/definition-v1-schema";

interface TemplatePreviewDialogProps {
  template: TemplateCardDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (templateIdOrSlug: string) => void;
  isUsing: boolean;
}

const typeIconMap: Record<QuestionType, React.ComponentType<{ className?: string }>> = {
  SHORT_TEXT: Type,
  LONG_TEXT: AlignLeft,
  EMAIL: Mail,
  PHONE: Phone,
  NUMBER: Hash,
  MULTIPLE_CHOICE: ListFilter,
  CHECKBOX: CheckSquare,
  DROPDOWN: ChevronDownSquare,
  DATE: Calendar,
  RATING: Star,
};

const typeLabelMap: Record<QuestionType, string> = {
  SHORT_TEXT: "Short Text",
  LONG_TEXT: "Long Text",
  EMAIL: "Email",
  PHONE: "Phone",
  NUMBER: "Number",
  MULTIPLE_CHOICE: "Multiple Choice",
  CHECKBOX: "Checkboxes",
  DROPDOWN: "Dropdown",
  DATE: "Date",
  RATING: "Rating",
};

export function TemplatePreviewDialog({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  isUsing,
}: TemplatePreviewDialogProps) {
  const [details, setDetails] = useState<TemplatePreviewDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fetch full preview details when dialog opens
  useEffect(() => {
    if (!isOpen || !template) {
      setDetails(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/v1/templates/${template.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load template preview");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setDetails(data.template);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load template");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, template]);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  const displayCategory =
    categoryLabels[template.categoryKey as TemplateCategoryKey] ||
    template.categoryKey;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-preview-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header with visual banner */}
        <div className="relative border-b border-slate-200 dark:border-white/10">
          <TemplatePreviewVisual
            themeKey={template.themeKey}
            categoryKey={template.categoryKey}
            slug={template.slug}
            title={template.title}
            className="h-28 rounded-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-xs border border-white/60 dark:border-white/10 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info header */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/60 text-[#563BFA] dark:text-violet-400 border border-violet-100 dark:border-violet-900/40">
              {displayCategory}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Theme: {template.themeKey || "Standard"}
            </span>
          </div>
          <h2
            id="template-preview-title"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
          >
            {template.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 min-h-[200px]">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Included Questions ({details?.definition.questions.length || template.questionCount})
            </span>
            <span className="text-[11px] text-slate-400">
              Structure preview • Not an active submission form
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#563BFA]" />
              <span className="text-xs">Loading form questions...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500 text-xs">
              {error}
            </div>
          ) : details?.definition.questions ? (
            <div className="space-y-2.5">
              {details.definition.questions.map((q, idx) => {
                const TypeIcon = typeIconMap[q.type] || Type;
                const typeName = typeLabelMap[q.type] || q.type;

                return (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5 flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-4">
                          {idx + 1}.
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          {q.label}
                        </span>
                        {q.required && (
                          <span className="text-red-500 text-xs font-bold" title="Required question">
                            *
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200/60 dark:border-white/10 text-[10px] text-slate-600 dark:text-slate-300 shrink-0 font-medium">
                        <TypeIcon className="w-3 h-3 text-slate-400" />
                        <span>{typeName}</span>
                      </div>
                    </div>

                    {q.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                        {q.description}
                      </p>
                    )}

                    {/* Question Options preview if applicable */}
                    {q.options && q.options.length > 0 && (
                      <div className="pl-6 pt-1 flex flex-wrap gap-1.5">
                        {q.options.map((opt) => (
                          <span
                            key={opt.id}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5"
                          >
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onUseTemplate(template.id)}
            disabled={isUsing}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#563BFA] hover:bg-[#462cee] transition-all flex items-center gap-2 shadow-xs shadow-violet-500/20",
              isUsing && "opacity-75 cursor-wait"
            )}
          >
            {isUsing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Draft...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Use Template</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
