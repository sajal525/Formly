"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TemplateCardDTO, TemplateCatalogResult } from "../server/get-template-catalog";
import {
  TemplateCategoryKey,
  TemplateQueryParams,
  TemplateSortKey,
} from "../schemas/template-query-schema";
import { TemplateQuickActions } from "./template-quick-actions";
import { TemplateFilters } from "./template-filters";
import { TemplateGrid } from "./template-grid";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { CheckCircle, AlertCircle, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface TemplatesClientProps {
  initialCatalog: TemplateCatalogResult;
  queryParams: TemplateQueryParams;
}

export function TemplatesClient({
  initialCatalog,
  queryParams,
}: TemplatesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active filters state (instant client response + URL sync)
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryKey>(
    queryParams.category
  );
  const [searchFilter, setSearchFilter] = useState<string>(queryParams.q);
  const [currentSort, setCurrentSort] = useState<TemplateSortKey>(queryParams.sort);

  useEffect(() => {
    setSelectedCategory(queryParams.category);
  }, [queryParams.category]);

  useEffect(() => {
    setSearchFilter(queryParams.q);
  }, [queryParams.q]);

  useEffect(() => {
    setCurrentSort(queryParams.sort);
  }, [queryParams.sort]);

  const [previewTemplate, setPreviewTemplate] = useState<TemplateCardDTO | null>(null);
  const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);
  const [isCreatingBlank, setIsCreatingBlank] = useState(false);

  // Success / notification state
  const [successNotice, setSuccessNotice] = useState<{
    title: string;
    message: string;
    formId: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Instant client-side filtering and sorting with fallback to initial catalog
  const displayedTemplates = useMemo(() => {
    let list = [...initialCatalog.items];

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      if (selectedCategory === "registration") {
        list = list.filter(
          (t) =>
            t.categoryKey === "registration" ||
            t.slug.includes("registration") ||
            t.title.toLowerCase().includes("registration")
        );
      } else {
        list = list.filter((t) => t.categoryKey === selectedCategory);
      }
    }

    // Search filter
    if (searchFilter && searchFilter.trim().length > 0) {
      const lower = searchFilter.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower)
      );
    }

    // Sorting
    if (currentSort === "name") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === "newest") {
      list.sort((a, b) => (b.featuredRank || 0) - (a.featuredRank || 0));
    } else {
      list.sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));
    }

    return list;
  }, [initialCatalog.items, selectedCategory, searchFilter, currentSort]);

  // Push URL search parameters updates
  const updateQueryParams = (newParams: Partial<TemplateQueryParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.category !== undefined) {
      setSelectedCategory(newParams.category);
      if (newParams.category === "all") {
        params.delete("category");
      } else {
        params.set("category", newParams.category);
      }
      params.delete("page");
    }

    if (newParams.q !== undefined) {
      setSearchFilter(newParams.q);
      if (newParams.q.trim().length === 0) {
        params.delete("q");
      } else {
        params.set("q", newParams.q.trim());
      }
      params.delete("page");
    }

    if (newParams.sort !== undefined) {
      setCurrentSort(newParams.sort);
      if (newParams.sort === "featured") {
        params.delete("sort");
      } else {
        params.set("sort", newParams.sort);
      }
    }

    if (newParams.page !== undefined) {
      if (newParams.page <= 1) {
        params.delete("page");
      } else {
        params.set("page", newParams.page.toString());
      }
    }

    const queryStr = params.toString();
    const targetUrl = queryStr ? `/templates?${queryStr}` : `/templates`;

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  // 1. Blank Form Action (reuses POST /api/v1/forms)
  const handleBlankForm = async () => {
    if (isCreatingBlank) return;
    setIsCreatingBlank(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled form",
          description: "Created from Blank Form",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create blank form");
      }

      setSuccessNotice({
        title: "Blank Draft Created",
        message: "Your new form is ready in My Forms library.",
        formId: data.form.id,
      });

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create blank form.");
    } finally {
      setIsCreatingBlank(false);
    }
  };

  // 2. Use Template Action
  const handleUseTemplate = async (templateIdOrSlug: string) => {
    if (usingTemplateId) return; // Prevent double submission
    setUsingTemplateId(templateIdOrSlug);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/templates/${templateIdOrSlug}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create form from template");
      }

      // Close preview modal if open
      setPreviewTemplate(null);

      // Display success notice
      setSuccessNotice({
        title: `Draft Form Created!`,
        message: `"${data.form.title}" is saved as a Draft with its complete question structure. You can manage it in My Forms.`,
        formId: data.form.id,
      });

      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to use template.");
    } finally {
      setUsingTemplateId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Success banner if a form was just created */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm block">
                {successNotice.title}
              </span>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
                {successNotice.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/my-forms"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Go to My Forms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error banner if an action failed */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center justify-between gap-3 text-rose-900 dark:text-rose-200 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-lg text-rose-600 hover:text-rose-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Title & Quick Actions Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 w-full">
        <div className="max-w-md">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Choose from professionally designed templates or start with a blank form.
          </p>
        </div>

        {/* Quick-start action tiles (Blank Form, AI, Upload) */}
        <div className="w-full xl:max-w-xl">
          <TemplateQuickActions
            onBlankForm={handleBlankForm}
            isCreatingBlank={isCreatingBlank}
          />
        </div>
      </div>

      {/* Filter and View Toolbar */}
      <div className="pt-2">
        <TemplateFilters
          currentCategory={selectedCategory}
          searchQuery={searchFilter}
          currentSort={currentSort}
          categoryCounts={initialCatalog.categoryCounts}
          onCategoryChange={(category) => updateQueryParams({ category })}
          onSearchChange={(q) => updateQueryParams({ q })}
          onSortChange={(sort) => updateQueryParams({ sort })}
        />
      </div>

      {/* Template Cards Grid */}
      <div className="relative min-h-[300px]">
        {isPending && (
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-2xs z-20 flex items-center justify-center rounded-2xl">
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Updating catalogue...
            </div>
          </div>
        )}

        <TemplateGrid
          templates={displayedTemplates}
          currentCategory={selectedCategory}
          searchQuery={searchFilter}
          onPreview={(template) => setPreviewTemplate(template)}
          onUseTemplate={(template) => handleUseTemplate(template.id)}
          onResetFilters={() => updateQueryParams({ category: "all", q: "" })}
          usingTemplateId={usingTemplateId}
        />
      </div>

      {/* Template Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={(id) => handleUseTemplate(id)}
        isUsing={!!usingTemplateId}
      />
    </div>
  );
}
