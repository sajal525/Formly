import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-dal";
import { FormStatus, DeviceCategory, SubmissionSource } from "@prisma/client";
import {
  AnalyticsQueryParams,
  AnalyticsDateRangePreset,
} from "../schemas/analytics-query-schema";
import {
  FormDefinitionV1,
  formDefinitionV1Schema,
  QuestionDefinition,
} from "@/features/templates/data/definition-v1-schema";

export interface AnalyticsKpiCardDTO {
  label: string;
  value: string;
  subtext: string;
  deltaText: string | null;
  deltaType: "positive" | "negative" | "neutral" | "none";
  tooltip: string;
}

export interface AnalyticsTimeSeriesPointDTO {
  dateKey: string;
  label: string;
  views: number;
  responses: number;
}

export interface AnalyticsDistributionItemDTO {
  name: string;
  key: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AnalyticsQuestionAnalysisDTO {
  questionId: string;
  label: string;
  type: string;
  totalAnswers: number;
  options: {
    label: string;
    value: string;
    count: number;
    percentage: number;
  }[];
}

export interface AnalyticsFunnelStageDTO {
  stage: string;
  count: number;
  percentage: number;
  description: string;
}

export interface AnalyticsHeatmapDayDTO {
  dateKey: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  count: number;
  level: number; // 0 = 0, 1 = 1-2, 2 = 3-5, 3 = 6-9, 4 = 10+
  label: string;
}

export interface FormAnalyticsDTO {
  forms: {
    id: string;
    title: string;
    status: FormStatus;
    themeKey: string | null;
    responseCount: number;
    updatedAt: string;
  }[];
  selectedForm: {
    id: string;
    title: string;
    status: FormStatus;
    themeKey: string | null;
    definition: FormDefinitionV1;
  } | null;
  rangePreset: AnalyticsDateRangePreset;
  rangeLabel: string;
  startDate: string;
  endDate: string;
  timezone: string;
  kpis: {
    responses: AnalyticsKpiCardDTO;
    views: AnalyticsKpiCardDTO;
    completionRate: AnalyticsKpiCardDTO;
    averageTime: AnalyticsKpiCardDTO;
    startedForms: AnalyticsKpiCardDTO;
  };
  timeSeries: AnalyticsTimeSeriesPointDTO[];
  deviceDistribution: AnalyticsDistributionItemDTO[];
  sourceDistribution: AnalyticsDistributionItemDTO[];
  topAnswerDistribution: {
    questionLabel: string;
    questionId: string;
    items: AnalyticsDistributionItemDTO[];
  } | null;
  secondAnswerDistribution: {
    questionLabel: string;
    questionId: string;
    items: AnalyticsDistributionItemDTO[];
  } | null;
  questionAnalysis: AnalyticsQuestionAnalysisDTO[];
  funnel: AnalyticsFunnelStageDTO[];
  heatmap: AnalyticsHeatmapDayDTO[];
}

const PALETTE = [
  "#8B5CF6", // violet
  "#3B82F6", // blue
  "#10B981", // emerald
  "#EC4899", // pink
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#F43F5E", // rose
  "#6366F1", // indigo
];

export async function getFormAnalytics(
  params: AnalyticsQueryParams
): Promise<FormAnalyticsDTO | null> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return null;
  }

  const userId = sessionData.user.id;

  // 1. Fetch user's forms
  const ownedForms = await prisma.form.findMany({
    where: {
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: {
      id: true,
      title: true,
      status: true,
      themeKey: true,
      updatedAt: true,
      _count: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });

  const formDTOs = ownedForms.map((f) => ({
    id: f.id,
    title: f.title,
    status: f.status,
    themeKey: f.themeKey,
    responseCount: f._count.responses,
    updatedAt: f.updatedAt.toISOString(),
  }));

  if (formDTOs.length === 0) {
    return {
      forms: [],
      selectedForm: null,
      rangePreset: params.range,
      rangeLabel: "Last 30 days",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      timezone: params.timezone,
      kpis: getEmptyKpis(),
      timeSeries: [],
      deviceDistribution: [],
      sourceDistribution: [],
      topAnswerDistribution: null,
      secondAnswerDistribution: null,
      questionAnalysis: [],
      funnel: [],
      heatmap: [],
    };
  }

  // 2. Select form
  let activeFormId = params.formId;
  const isValidRequested =
    activeFormId && formDTOs.some((f) => f.id === activeFormId);

  if (!isValidRequested) {
    const withData = formDTOs.find((f) => f.responseCount > 0);
    activeFormId = withData ? withData.id : formDTOs[0].id;
  }

  const selectedFormRecord = await prisma.form.findFirst({
    where: {
      id: activeFormId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: {
      id: true,
      title: true,
      status: true,
      themeKey: true,
      definition: true,
    },
  });

  if (!selectedFormRecord) {
    return null;
  }

  const parsedDef = formDefinitionV1Schema.safeParse(
    selectedFormRecord.definition
  );
  const formDefinition: FormDefinitionV1 = parsedDef.success
    ? parsedDef.data
    : {
        schemaVersion: 1,
        title: selectedFormRecord.title,
        description: null,
        themeKey: selectedFormRecord.themeKey || "default",
        questions: [],
      };

  const questions: QuestionDefinition[] = formDefinition.questions || [];

  // 3. Resolve Date Intervals (Current Period & Previous Comparison Period)
  const { currentStart, currentEnd, prevStart, prevEnd, rangeLabel } =
    resolveDateRanges(params.range, params.from, params.to);

  // 4. Run grouped aggregations for Current and Previous periods (sequential to preserve connection pool)
  const currentResponses = await prisma.formResponse.findMany({
    where: {
      formId: selectedFormRecord.id,
      submittedAt: { gte: currentStart, lte: currentEnd },
    },
    select: {
      id: true,
      submittedAt: true,
      durationSeconds: true,
      answers: true,
      responseSessionId: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  const prevResponses = await prisma.formResponse.count({
    where: {
      formId: selectedFormRecord.id,
      submittedAt: { gte: prevStart, lte: prevEnd },
    },
  });

  const currentSessions = await prisma.responseSession.findMany({
    where: {
      formId: selectedFormRecord.id,
      startedAt: { gte: currentStart, lte: currentEnd },
    },
    select: {
      id: true,
      startedAt: true,
      firstInteractionAt: true,
      reachedLastQuestionAt: true,
      completedAt: true,
      deviceCategory: true,
      sourceKey: true,
    },
    orderBy: { startedAt: "asc" },
  });

  const prevSessions = await prisma.responseSession.findMany({
    where: {
      formId: selectedFormRecord.id,
      startedAt: { gte: prevStart, lte: prevEnd },
    },
    select: {
      id: true,
      completedAt: true,
      firstInteractionAt: true,
    },
  });

  const currentAvgDuration = await prisma.formResponse.aggregate({
    where: {
      formId: selectedFormRecord.id,
      submittedAt: { gte: currentStart, lte: currentEnd },
      durationSeconds: { not: null },
    },
    _avg: { durationSeconds: true },
  });

  const prevAvgDuration = await prisma.formResponse.aggregate({
    where: {
      formId: selectedFormRecord.id,
      submittedAt: { gte: prevStart, lte: prevEnd },
      durationSeconds: { not: null },
    },
    _avg: { durationSeconds: true },
  });

  // 5. Calculate KPI Metrics & Deltas
  const totalCurrResponses = currentResponses.length;
  const totalPrevResponses = prevResponses;
  const responsesDelta = calculateDelta(
    totalCurrResponses,
    totalPrevResponses,
    rangeLabel
  );

  const totalCurrViews = currentSessions.length;
  const totalPrevViews = prevSessions.length;
  const viewsDelta = calculateDelta(totalCurrViews, totalPrevViews, rangeLabel);

  // Completion Rate: completed sessions in cohort / total sessions in cohort
  const currCompletedSessions = currentSessions.filter((s) => s.completedAt !== null).length;
  const prevCompletedSessions = prevSessions.filter((s) => s.completedAt !== null).length;

  const currCompletionRate =
    totalCurrViews > 0
      ? Math.round((currCompletedSessions / totalCurrViews) * 100)
      : null;
  const prevCompletionRate =
    totalPrevViews > 0
      ? Math.round((prevCompletedSessions / totalPrevViews) * 100)
      : null;

  const completionDelta =
    currCompletionRate !== null && prevCompletionRate !== null
      ? calculatePointDelta(currCompletionRate, prevCompletionRate, rangeLabel)
      : currCompletionRate !== null
      ? { text: "New activity", type: "neutral" as const }
      : { text: null, type: "none" as const };

  // Average Duration
  const currAvgSeconds =
    currentAvgDuration._avg.durationSeconds !== null
      ? Math.round(currentAvgDuration._avg.durationSeconds)
      : null;
  const prevAvgSeconds =
    prevAvgDuration._avg.durationSeconds !== null
      ? Math.round(prevAvgDuration._avg.durationSeconds)
      : null;

  const avgTimeDelta =
    currAvgSeconds !== null && prevAvgSeconds !== null
      ? calculateDurationDelta(currAvgSeconds, prevAvgSeconds, rangeLabel)
      : { text: null, type: "none" as const };

  // Started Forms (qualified sessions with firstInteractionAt)
  const currStartedForms = currentSessions.filter(
    (s) => s.firstInteractionAt !== null
  ).length;
  const prevStartedForms = prevSessions.filter(
    (s) => s.firstInteractionAt !== null
  ).length;
  const startedDelta = calculateDelta(
    currStartedForms,
    prevStartedForms,
    rangeLabel
  );

  const kpis = {
    responses: {
      label: "Total Responses",
      value: totalCurrResponses.toLocaleString(),
      subtext: "All completed submissions in period",
      deltaText: responsesDelta.text,
      deltaType: responsesDelta.type,
      tooltip:
        "Count of completed FormResponse records whose submittedAt timestamp falls within the selected date range.",
    },
    views: {
      label: "Form Views",
      value: totalCurrViews.toLocaleString(),
      subtext: "Qualified sessions started",
      deltaText: viewsDelta.text,
      deltaType: viewsDelta.type,
      tooltip:
        "Count of qualified respondent sessions started in the range. Excludes automated crawler hits and bot requests.",
    },
    completionRate: {
      label: "Completion Rate",
      value: currCompletionRate !== null ? `${currCompletionRate}%` : "Not tracked yet",
      subtext: "Completed ÷ Started in period",
      deltaText: completionDelta.text,
      deltaType: completionDelta.type,
      tooltip:
        "Percentage of respondent sessions started in this period that reached full submission.",
    },
    averageTime: {
      label: "Average Time",
      value: formatDuration(currAvgSeconds),
      subtext: "Session start to submission",
      deltaText: avgTimeDelta.text,
      deltaType: avgTimeDelta.type,
      tooltip:
        "Mean elapsed time from respondent start to successful completion for submissions inside this range.",
    },
    startedForms: {
      label: "Started Forms",
      value: currStartedForms.toLocaleString(),
      subtext: "Reached first interaction",
      deltaText: startedDelta.text,
      deltaType: startedDelta.type,
      tooltip:
        "Count of qualified sessions whose first interaction occurred inside the selected date range.",
    },
  };

  // 6. Time Series: Daily Views & Responses
  const timeSeries = computeDailyTimeSeries(
    currentStart,
    currentEnd,
    currentSessions,
    currentResponses
  );

  // 7. Device Mix & Submission Source Distributions
  const deviceDistribution = computeDeviceDistribution(currentSessions);
  const sourceDistribution = computeSourceDistribution(currentSessions);

  // 8. Answer Distributions for Top and Second Structured Questions
  const eligibleQuestions = questions.filter((q) =>
    ["MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOX", "RATING"].includes(q.type)
  );

  const topAnswerDistribution =
    eligibleQuestions.length > 0
      ? computeQuestionDistribution(eligibleQuestions[0], currentResponses)
      : null;

  const secondAnswerDistribution =
    eligibleQuestions.length > 1
      ? computeQuestionDistribution(eligibleQuestions[1], currentResponses)
      : null;

  // 9. Question-wise Analysis for picker
  const questionAnalysis = questions.map((q) =>
    computeQuestionAnalysis(q, currentResponses)
  );

  // 10. Funnel Stages (Monotonic cohort from views in current period)
  const reachedLastCount = currentSessions.filter(
    (s) => s.reachedLastQuestionAt !== null || s.completedAt !== null
  ).length;

  const funnel: AnalyticsFunnelStageDTO[] = [
    {
      stage: "Form Views",
      count: totalCurrViews,
      percentage: 100,
      description: "Qualified respondent sessions initiated",
    },
    {
      stage: "Started Form",
      count: Math.min(totalCurrViews, currStartedForms),
      percentage:
        totalCurrViews > 0
          ? Math.round(
              (Math.min(totalCurrViews, currStartedForms) / totalCurrViews) *
                100
            )
          : 0,
      description: "Interacted with at least one question",
    },
    {
      stage: "Reached Last Question",
      count: Math.min(totalCurrViews, reachedLastCount),
      percentage:
        totalCurrViews > 0
          ? Math.round(
              (Math.min(totalCurrViews, reachedLastCount) / totalCurrViews) *
                100
            )
          : 0,
      description: "Progressed through all required questions",
    },
    {
      stage: "Submitted",
      count: Math.min(totalCurrViews, currCompletedSessions),
      percentage:
        totalCurrViews > 0
          ? Math.round(
              (Math.min(totalCurrViews, currCompletedSessions) /
                totalCurrViews) *
                100
            )
          : 0,
      description: "Successfully recorded final response",
    },
  ];

  // 11. Response Timeline Calendar Heatmap (Last 35 days grid)
  const heatmap = computeHeatmap(currentEnd, currentResponses);

  return {
    forms: formDTOs,
    selectedForm: {
      id: selectedFormRecord.id,
      title: selectedFormRecord.title,
      status: selectedFormRecord.status,
      themeKey: selectedFormRecord.themeKey,
      definition: formDefinition,
    },
    rangePreset: params.range,
    rangeLabel,
    startDate: currentStart.toISOString(),
    endDate: currentEnd.toISOString(),
    timezone: params.timezone,
    kpis,
    timeSeries,
    deviceDistribution,
    sourceDistribution,
    topAnswerDistribution,
    secondAnswerDistribution,
    questionAnalysis,
    funnel,
    heatmap,
  };
}

// Helper functions

function resolveDateRanges(
  range: AnalyticsDateRangePreset,
  customFrom?: string,
  customTo?: string
) {
  const now = new Date();
  let days = 30;
  let rangeLabel = "vs previous 30 days";

  if (range === "7d") {
    days = 7;
    rangeLabel = "vs previous 7 days";
  } else if (range === "90d") {
    days = 90;
    rangeLabel = "vs previous 90 days";
  } else if (range === "all") {
    days = 60;
    rangeLabel = "vs previous 60 days";
  } else if (range === "custom" && customFrom && customTo) {
    const f = new Date(customFrom + "T00:00:00Z");
    const t = new Date(customTo + "T23:59:59Z");
    const diffDays = Math.max(
      1,
      Math.round((t.getTime() - f.getTime()) / (1000 * 60 * 60 * 24))
    );
    const prevStart = new Date(f.getTime() - diffDays * 24 * 60 * 60 * 1000);
    const prevEnd = new Date(f.getTime() - 1000);

    return {
      currentStart: f,
      currentEnd: t,
      prevStart,
      prevEnd,
      rangeLabel: `vs previous ${diffDays} days`,
    };
  }

  const currentEnd = new Date(now);
  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevEnd = new Date(currentStart.getTime() - 1000);
  const prevStart = new Date(prevEnd.getTime() - days * 24 * 60 * 60 * 1000);

  return { currentStart, currentEnd, prevStart, prevEnd, rangeLabel };
}

function calculateDelta(curr: number, prev: number, rangeLabel: string) {
  if (prev === 0) {
    if (curr > 0) return { text: "New activity", type: "neutral" as const };
    return { text: null, type: "none" as const };
  }
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct > 0) {
    return { text: `↑ ${pct}% ${rangeLabel}`, type: "positive" as const };
  }
  if (pct < 0) {
    return { text: `↓ ${Math.abs(pct)}% ${rangeLabel}`, type: "negative" as const };
  }
  return { text: `0% ${rangeLabel}`, type: "neutral" as const };
}

function calculatePointDelta(curr: number, prev: number, rangeLabel: string) {
  const diff = curr - prev;
  if (diff > 0) {
    return { text: `↑ ${diff}% ${rangeLabel}`, type: "positive" as const };
  }
  if (diff < 0) {
    return { text: `↓ ${Math.abs(diff)}% ${rangeLabel}`, type: "negative" as const };
  }
  return { text: `0% ${rangeLabel}`, type: "neutral" as const };
}

function calculateDurationDelta(curr: number, prev: number, rangeLabel: string) {
  const diff = Math.round(((curr - prev) / prev) * 100);
  if (diff > 0) {
    return { text: `↑ ${diff}% ${rangeLabel}`, type: "neutral" as const };
  }
  if (diff < 0) {
    return { text: `↓ ${Math.abs(diff)}% ${rangeLabel}`, type: "positive" as const };
  }
  return { text: `0% ${rangeLabel}`, type: "neutral" as const };
}

function formatDuration(seconds: number | null) {
  if (seconds === null || seconds === undefined) return "Not tracked yet";
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
}

function computeDailyTimeSeries(
  start: Date,
  end: Date,
  sessions: { startedAt: Date }[],
  responses: { submittedAt: Date }[]
): AnalyticsTimeSeriesPointDTO[] {
  const dateMap: Record<string, { views: number; responses: number; label: string }> = {};

  const cur = new Date(start);
  while (cur <= end) {
    const key = cur.toISOString().split("T")[0];
    const label = cur.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    dateMap[key] = { views: 0, responses: 0, label };
    cur.setDate(cur.getDate() + 1);
  }

  sessions.forEach((s) => {
    const k = s.startedAt.toISOString().split("T")[0];
    if (dateMap[k]) dateMap[k].views++;
  });

  responses.forEach((r) => {
    const k = r.submittedAt.toISOString().split("T")[0];
    if (dateMap[k]) dateMap[k].responses++;
  });

  return Object.entries(dateMap).map(([dateKey, val]) => ({
    dateKey,
    label: val.label,
    views: val.views,
    responses: val.responses,
  }));
}

function computeDeviceDistribution(
  sessions: { deviceCategory: DeviceCategory }[]
): AnalyticsDistributionItemDTO[] {
  const counts: Record<string, number> = {
    Mobile: 0,
    Desktop: 0,
    Tablet: 0,
    Others: 0,
  };

  sessions.forEach((s) => {
    if (s.deviceCategory === "MOBILE") counts.Mobile++;
    else if (s.deviceCategory === "DESKTOP") counts.Desktop++;
    else if (s.deviceCategory === "TABLET") counts.Tablet++;
    else counts.Others++;
  });

  const total = sessions.length;
  const config = [
    { key: "MOBILE", name: "Mobile", color: "#8B5CF6" },
    { key: "DESKTOP", name: "Desktop", color: "#3B82F6" },
    { key: "TABLET", name: "Tablet", color: "#EC4899" },
    { key: "OTHERS", name: "Others", color: "#94A3B8" },
  ];

  return config.map((c) => {
    const count = counts[c.name] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      key: c.key,
      name: c.name,
      count,
      percentage,
      color: c.color,
    };
  });
}

function computeSourceDistribution(
  sessions: { sourceKey: SubmissionSource }[]
): AnalyticsDistributionItemDTO[] {
  const counts: Record<string, number> = {
    "Direct Link": 0,
    "QR Code": 0,
    Embedded: 0,
    "Shared Link": 0,
  };

  sessions.forEach((s) => {
    if (s.sourceKey === "DIRECT") counts["Direct Link"]++;
    else if (s.sourceKey === "QR") counts["QR Code"]++;
    else if (s.sourceKey === "EMBED") counts.Embedded++;
    else counts["Shared Link"]++;
  });

  const total = sessions.length;
  const config = [
    { key: "DIRECT", name: "Direct Link", color: "#8B5CF6" },
    { key: "QR", name: "QR Code", color: "#3B82F6" },
    { key: "EMBED", name: "Embedded", color: "#EC4899" },
    { key: "SHARED", name: "Shared Link", color: "#F59E0B" },
  ];

  return config.map((c) => {
    const count = counts[c.name] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      key: c.key,
      name: c.name,
      count,
      percentage,
      color: c.color,
    };
  });
}

function computeQuestionDistribution(
  question: QuestionDefinition,
  responses: { answers: any }[]
): {
  questionLabel: string;
  questionId: string;
  items: AnalyticsDistributionItemDTO[];
} {
  const counts: Record<string, number> = {};
  let totalAnswered = 0;

  responses.forEach((r) => {
    const ansObj = (r.answers || {}) as Record<string, any>;
    const val = ansObj[question.id];
    if (val !== undefined && val !== null && val !== "") {
      totalAnswered++;
      if (Array.isArray(val)) {
        val.forEach((item) => {
          const k = String(item);
          counts[k] = (counts[k] || 0) + 1;
        });
      } else {
        const k = String(val);
        counts[k] = (counts[k] || 0) + 1;
      }
    }
  });

  const options = question.options || [];
  let items: AnalyticsDistributionItemDTO[] = [];

  if (question.type === "RATING") {
    for (let s = 5; s >= 1; s--) {
      const c = counts[String(s)] || 0;
      const pct = totalAnswered > 0 ? Math.round((c / totalAnswered) * 100) : 0;
      items.push({
        key: String(s),
        name: `${s} Star${s > 1 ? "s" : ""}`,
        count: c,
        percentage: pct,
        color: PALETTE[(5 - s) % PALETTE.length],
      });
    }
  } else if (options.length > 0) {
    items = options.map((opt, idx) => {
      const c = counts[opt.value] || 0;
      const pct = totalAnswered > 0 ? Math.round((c / totalAnswered) * 100) : 0;
      return {
        key: opt.value,
        name: opt.label,
        count: c,
        percentage: pct,
        color: PALETTE[idx % PALETTE.length],
      };
    });
  }

  return {
    questionLabel: question.label,
    questionId: question.id,
    items,
  };
}

function computeQuestionAnalysis(
  question: QuestionDefinition,
  responses: { answers: any }[]
): AnalyticsQuestionAnalysisDTO {
  const counts: Record<string, number> = {};
  let totalAnswers = 0;

  responses.forEach((r) => {
    const ansObj = (r.answers || {}) as Record<string, any>;
    const val = ansObj[question.id];
    if (val !== undefined && val !== null && val !== "") {
      totalAnswers++;
      if (Array.isArray(val)) {
        val.forEach((item) => {
          const k = String(item);
          counts[k] = (counts[k] || 0) + 1;
        });
      } else {
        const k = String(val);
        counts[k] = (counts[k] || 0) + 1;
      }
    }
  });

  const options = (question.options || []).map((opt) => {
    const c = counts[opt.value] || 0;
    const pct = totalAnswers > 0 ? Math.round((c / totalAnswers) * 100) : 0;
    return {
      label: opt.label,
      value: opt.value,
      count: c,
      percentage: pct,
    };
  });

  if (question.type === "RATING") {
    for (let s = 1; s <= 5; s++) {
      const c = counts[String(s)] || 0;
      const pct = totalAnswers > 0 ? Math.round((c / totalAnswers) * 100) : 0;
      options.push({
        label: `${s} Star${s > 1 ? "s" : ""}`,
        value: String(s),
        count: c,
        percentage: pct,
      });
    }
  }

  return {
    questionId: question.id,
    label: question.label,
    type: question.type,
    totalAnswers,
    options,
  };
}

function computeHeatmap(
  endDate: Date,
  responses: { submittedAt: Date }[]
): AnalyticsHeatmapDayDTO[] {
  const daysCount = 35; // 5 weeks
  const items: AnalyticsHeatmapDayDTO[] = [];
  const countsByDate: Record<string, number> = {};

  responses.forEach((r) => {
    const k = r.submittedAt.toISOString().split("T")[0];
    countsByDate[k] = (countsByDate[k] || 0) + 1;
  });

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const count = countsByDate[dateKey] || 0;

    let level = 0;
    if (count >= 10) level = 4;
    else if (count >= 6) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;

    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

    items.push({
      dateKey,
      dayOfWeek: d.getUTCDay(),
      count,
      level,
      label,
    });
  }

  return items;
}

function getEmptyKpis() {
  return {
    responses: {
      label: "Total Responses",
      value: "0",
      subtext: "No submissions recorded",
      deltaText: null,
      deltaType: "none" as const,
      tooltip: "Count of completed FormResponse records in the date range.",
    },
    views: {
      label: "Form Views",
      value: "0",
      subtext: "No visits recorded",
      deltaText: null,
      deltaType: "none" as const,
      tooltip: "Qualified sessions started in the date range.",
    },
    completionRate: {
      label: "Completion Rate",
      value: "Not tracked yet",
      subtext: "No session starts",
      deltaText: null,
      deltaType: "none" as const,
      tooltip: "Completed sessions divided by qualified session starts.",
    },
    averageTime: {
      label: "Average Time",
      value: "Not tracked yet",
      subtext: "No session data",
      deltaText: null,
      deltaType: "none" as const,
      tooltip: "Mean duration from session start to submission.",
    },
    startedForms: {
      label: "Started Forms",
      value: "0",
      subtext: "No interactions recorded",
      deltaText: null,
      deltaType: "none" as const,
      tooltip: "Qualified sessions reaching the first question interaction.",
    },
  };
}
