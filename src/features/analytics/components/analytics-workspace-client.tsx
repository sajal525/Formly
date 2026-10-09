"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormAnalyticsDTO } from "../server/get-form-analytics";
import { AnalyticsDateRangePreset } from "../schemas/analytics-query-schema";
import { AnalyticsHeader } from "./analytics-header";
import { AnalyticsKpiCards } from "./analytics-kpi-cards";
import { ResponseTrendChart } from "./response-trend-chart";
import { ViewsVsResponsesChart } from "./views-vs-responses-chart";
import { DeviceDistributionChart } from "./device-distribution-chart";
import {
  TopCategoryDistributionChart,
  SecondAnswerDistributionChart,
} from "./answer-distribution-chart";
import { SubmissionSourceChart } from "./submission-source-chart";
import { QuestionWiseAnalysis } from "./question-wise-analysis";
import { CompletionFunnel } from "./completion-funnel";
import { ResponseTimelineHeatmap } from "./response-timeline-heatmap";
import { FilePlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AnalyticsWorkspaceClientProps {
  initialData: FormAnalyticsDTO;
}

export function AnalyticsWorkspaceClient({
  initialData,
}: AnalyticsWorkspaceClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const {
    forms,
    selectedForm,
    rangePreset,
    startDate,
    endDate,
    timezone,
    kpis,
    timeSeries,
    deviceDistribution,
    sourceDistribution,
    topAnswerDistribution,
    secondAnswerDistribution,
    questionAnalysis,
    funnel,
    heatmap,
  } = initialData;

  const updateUrl = (updates: Record<string, string | null | undefined>) => {
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
    updateUrl({ formId });
  };

  const handleSelectRange = (
    range: AnalyticsDateRangePreset,
    from?: string,
    to?: string
  ) => {
    if (range === "custom") {
      updateUrl({
        range: "custom",
        from: from || null,
        to: to || null,
      });
    } else {
      updateUrl({
        range,
        from: null,
        to: null,
      });
    }
  };

  const handleExportAnalyticsCsv = async () => {
    if (!selectedForm) return;

    try {
      setIsExporting(true);
      const res = await fetch(
        `/api/v1/forms/${selectedForm.id}/analytics/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            range: rangePreset,
            startDate: rangePreset === "custom" ? startDate : undefined,
            endDate: rangePreset === "custom" ? endDate : undefined,
            timezone,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to export analytics report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = selectedForm.title
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      a.download = `${cleanTitle}-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Analytics CSV report exported successfully.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to download export", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportResponsesCsv = async () => {
    if (!selectedForm) return;

    try {
      setIsExporting(true);
      const res = await fetch(
        `/api/v1/forms/${selectedForm.id}/responses/export`
      );

      if (!res.ok) {
        throw new Error("Failed to export responses CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = selectedForm.title
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      a.download = `${cleanTitle}-responses-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Responses CSV exported successfully.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to download responses", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // State 1: No forms exist for user
  if (forms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Get detailed insights and understand your form performance.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs max-w-lg mx-auto mt-12 space-y-4">
          <div className="w-14 h-14 bg-violet-50 dark:bg-violet-950/60 text-violet-600 rounded-2xl flex items-center justify-center mx-auto">
            <FilePlus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No forms created yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Analytics are generated from real respondent views, progression, and
            completed submissions. Create or publish your first form to start
            gathering insights.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/templates">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                Browse Templates
              </Button>
            </Link>
            <Link href="/forms">
              <Button variant="outline" className="rounded-xl">
                My Forms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: User has forms, render analytics workspace
  const totalCompletedResponses = parseInt(kpis.responses.value, 10) || 0;

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{toast.text}</span>
        </div>
      )}

      {/* Analytics Header Controls */}
      <AnalyticsHeader
        forms={forms}
        selectedFormId={selectedForm?.id || null}
        currentRange={rangePreset}
        customFrom={rangePreset === "custom" ? startDate : undefined}
        customTo={rangePreset === "custom" ? endDate : undefined}
        totalResponses={totalCompletedResponses}
        onSelectForm={handleSelectForm}
        onSelectRange={handleSelectRange}
        onExportAnalyticsCsv={handleExportAnalyticsCsv}
        onExportResponsesCsv={handleExportResponsesCsv}
        isExporting={isExporting}
      />

      {/* KPI Cards Row */}
      <AnalyticsKpiCards kpis={kpis} />

      {/* Main Responsive Chart Grid */}
      <div className="space-y-6">
        {/* Row 1: Activity & Device Mix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <ResponseTrendChart
            timeSeries={timeSeries}
            rangeLabel={initialData.rangeLabel}
            className="lg:col-span-4"
          />
          <ViewsVsResponsesChart
            timeSeries={timeSeries}
            className="lg:col-span-5"
          />
          <DeviceDistributionChart
            distribution={deviceDistribution}
            className="lg:col-span-3"
          />
        </div>

        {/* Row 2: Answer & Source Distributions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {topAnswerDistribution ? (
            <TopCategoryDistributionChart
              questionLabel={topAnswerDistribution.questionLabel}
              items={topAnswerDistribution.items}
              className="lg:col-span-4"
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-center items-center text-center text-slate-400 text-xs min-h-[220px] lg:col-span-4">
              <span className="font-semibold text-slate-600 dark:text-slate-300 text-sm mb-1">
                Top Respondent Category
              </span>
              <span>No structured category question in this form yet.</span>
            </div>
          )}

          {secondAnswerDistribution ? (
            <SecondAnswerDistributionChart
              questionLabel={secondAnswerDistribution.questionLabel}
              items={secondAnswerDistribution.items}
              className="lg:col-span-4"
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-center items-center text-center text-slate-400 text-xs min-h-[220px] lg:col-span-4">
              <span className="font-semibold text-slate-600 dark:text-slate-300 text-sm mb-1">
                Secondary Distribution
              </span>
              <span>No second structured question available to display.</span>
            </div>
          )}

          <SubmissionSourceChart
            distribution={sourceDistribution}
            className="lg:col-span-4"
          />
        </div>

        {/* Row 3: Progression Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <QuestionWiseAnalysis
            questions={questionAnalysis}
            className="lg:col-span-4"
          />
          <CompletionFunnel
            stages={funnel}
            className="lg:col-span-4"
          />
          <ResponseTimelineHeatmap
            heatmap={heatmap}
            className="lg:col-span-4"
          />
        </div>
      </div>
    </div>
  );
}
