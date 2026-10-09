"use client";

import React from "react";
import { TemplateCardDTO } from "../server/get-template-catalog";
import { TemplateCard } from "./template-card";
import { LayoutGrid, SearchX } from "lucide-react";
import { TemplateCategoryKey, categoryLabels } from "../schemas/template-query-schema";

interface TemplateGridProps {
  templates: TemplateCardDTO[];
  currentCategory: TemplateCategoryKey;
  searchQuery: string;
  onPreview: (template: TemplateCardDTO) => void;
  onUseTemplate: (template: TemplateCardDTO) => void;
  onResetFilters: () => void;
  usingTemplateId: string | null;
}

export function TemplateGrid({
  templates,
  currentCategory,
  searchQuery,
  onPreview,
  onUseTemplate,
  onResetFilters,
  usingTemplateId,
}: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="w-full py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center text-center my-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          {searchQuery ? (
            <SearchX className="w-7 h-7" />
          ) : (
            <LayoutGrid className="w-7 h-7" />
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {searchQuery ? "No matching templates found" : "No templates in this category"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
          {searchQuery
            ? `We couldn't find any templates matching "${searchQuery}". Try adjusting your keywords or category filter.`
            : `There are currently no templates in "${categoryLabels[currentCategory]}". Check back soon or explore other categories.`}
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#563BFA] hover:bg-[#462cee] transition-colors shadow-xs"
        >
          View all templates
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onPreview={onPreview}
          onUseTemplate={onUseTemplate}
          isUsing={usingTemplateId === template.id || usingTemplateId === template.slug}
        />
      ))}
    </div>
  );
}
