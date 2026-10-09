"use client";

import React from "react";
import { ListChecks, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateCardDTO } from "../server/get-template-catalog";
import { TemplatePreviewVisual } from "./template-preview-visual";
import { categoryLabels, TemplateCategoryKey } from "../schemas/template-query-schema";

interface TemplateCardProps {
  template: TemplateCardDTO;
  onPreview: (template: TemplateCardDTO) => void;
  onUseTemplate: (template: TemplateCardDTO) => void;
  isUsing: boolean;
}

export function TemplateCard({
  template,
  onPreview,
  onUseTemplate,
  isUsing,
}: TemplateCardProps) {
  const displayCategory =
    categoryLabels[template.categoryKey as TemplateCategoryKey] ||
    template.categoryKey;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-white/20">
      {/* Visual Thumbnail */}
      <div className="relative">
        <TemplatePreviewVisual
          themeKey={template.themeKey}
          categoryKey={template.categoryKey}
          slug={template.slug}
          title={template.title}
        />
        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-xs border border-white/60 dark:border-white/10 backdrop-blur-xs">
          {displayCategory}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1"
            title={template.title}
          >
            {template.title}
          </h3>
          <p
            className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]"
            title={template.description}
          >
            {template.description}
          </p>
        </div>

        {/* Truthful metadata: questions count */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium my-3">
          <ListChecks className="w-3.5 h-3.5" />
          <span>
            {template.questionCount} {template.questionCount === 1 ? "question" : "questions"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors text-center"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => onUseTemplate(template)}
            disabled={isUsing}
            className={cn(
              "w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#563BFA] hover:bg-[#462cee] transition-all text-center flex items-center justify-center gap-1.5 shadow-xs shadow-violet-500/10",
              isUsing && "opacity-75 cursor-wait"
            )}
          >
            {isUsing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Use Template</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
