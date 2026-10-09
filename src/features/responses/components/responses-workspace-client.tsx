"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ResponsesWorkspaceDTO } from "../server/get-responses-workspace";
import {
  ResponseTab,
  ResponseSort,
  ResponsePageSize,
  ResponseDateRange,
} from "../schemas/response-query-schema";
import { ResponsesHeader } from "./responses-header";
import { ResponseSummaryCards } from "./response-summary-cards";
import { ResponsesTabBar } from "./responses-tab-bar";
import { ResponseTableView } from "./response-table-view";
import { ResponseAnalyticsSection } from "./response-analytics-section";
import { IndividualView } from "./individual-view";
import { SummaryView } from "./summary-view";
import { AlertCircle, FilePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ResponsesWorkspaceClientProps {
  initialData: ResponsesWorkspaceDTO;
  currentTab: ResponseTab;
  currentSort: ResponseSort;
  currentPageSize: ResponsePageSize;
  currentDateRange: ResponseDateRange;
  currentSearch?: string;
  currentResponseId?: string;
}

export function ResponsesWorkspaceClient({
  initialData,
  currentTab,
  currentSort,
  currentPageSize,
  currentDateRange,
  currentSearch = "",
  currentResponseId,
}: ResponsesWorkspaceClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    forms,
    selectedForm,
    kpis,
    displayColumns,
    responses,
    pagination,
    timeSeries,
    questionSummaries,
    selectedResponse,
  } = initialData;

  // Helper to push URL updates
  const updateUrl = (updates: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSelectForm = (formId: string) => {
    updateUrl({
      formId,
      page: 1,
      responseId: null,
      search: null,
    });
  };

  const handleTabChange = (tab: ResponseTab) => {
    updateUrl({ tab });
  };

  const handleSortChange = (sort: ResponseSort) => {
    updateUrl({ sort, page: 1 });
  };

  const handlePageSizeChange = (pageSize: ResponsePageSize) => {
    updateUrl({ pageSize, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page });
  };

  const handleSearchChange = (search: string) => {
    updateUrl({ search: search || null, page: 1 });
  };

  const handleDateRangeChange = (dateRange: ResponseDateRange) => {
    updateUrl({ dateRange });
  };

  const handleSelectResponse = (responseId: string | null) => {
    updateUrl({ responseId });
  };

  // CSV Export Trigger
  const handleExportCsv = async (selectedIds?: string[]) => {
    if (!selectedForm) return;

    setIsExporting(true);
    setExportError(null);

    try {
      let url = `/api/v1/forms/${selectedForm.id}/responses/export`;
      if (selectedIds && selectedIds.length > 0) {
        url += `?selectedIds=${encodeURIComponent(selectedIds.join(","))}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download CSV export.");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = `responses-${selectedForm.id}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // Trigger browser download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      setExportError(err.message || "Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Empty state: No forms created yet
  if (forms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Responses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage submissions from any of your forms.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-4">
            <FilePlus className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No Forms Created Yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            You don&apos;t have any forms yet. Create a form from our templates catalogue or start a new form to begin collecting real responses.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/templates">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs sm:text-sm font-semibold">
                Browse Templates
              </Button>
            </Link>
            <Link href="/my-forms">
              <Button variant="outline" className="rounded-xl text-xs sm:text-sm font-semibold">
                My Forms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Error Alert */}
      {exportError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{exportError}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-rose-500 hover:text-rose-800 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Header with form combobox & shortcut strip */}
      <ResponsesHeader
        forms={forms}
        selectedFormId={selectedForm?.id || null}
        kpis={kpis}
        onSelectForm={handleSelectForm}
        onExportCsv={() => handleExportCsv()}
        isExporting={isExporting}
      />

      {/* Summary KPI Cards */}
      <ResponseSummaryCards kpis={kpis} />

      {/* Analytics Charts Section (Responses over time, answer distributions) */}
      <ResponseAnalyticsSection
        timeSeries={timeSeries}
        questionSummaries={questionSummaries}
        totalResponses={kpis.totalResponses}
        currentDateRange={currentDateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Navigation Tabs Bar */}
      <div className="pt-2">
        <ResponsesTabBar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          responseCount={kpis.totalResponses}
        />
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {currentTab === "responses" && (
          <ResponseTableView
            formId={selectedForm?.id || ""}
            columns={displayColumns}
            responses={responses}
            selectedResponse={selectedResponse}
            pagination={pagination}
            searchQuery={currentSearch}
            sort={currentSort}
            pageSize={currentPageSize}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
            onSelectResponse={handleSelectResponse}
            onExportSelected={(ids) => handleExportCsv(ids)}
          />
        )}

        {currentTab === "summary" && (
          <SummaryView
            questionSummaries={questionSummaries}
            totalResponses={kpis.totalResponses}
          />
        )}

        {currentTab === "individual" && (
          <IndividualView
            selectedResponse={selectedResponse}
            totalResponses={kpis.totalResponses}
            allResponses={responses}
            onNavigate={handleSelectResponse}
          />
        )}

        {currentTab === "analytics" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 text-xs text-violet-800 dark:text-violet-300">
              <span className="font-semibold">Analytics overview:</span> Displays truthful aggregated time-series submissions and choice distribution data backed directly by verified Neon database records.
            </div>
            <SummaryView
              questionSummaries={questionSummaries}
              totalResponses={kpis.totalResponses}
            />
          </div>
        )}
      </div>
    </div>
  );
}
