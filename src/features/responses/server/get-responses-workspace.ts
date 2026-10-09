import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-dal";
import { FormStatus } from "@prisma/client";
import {
  ResponseWorkspaceQueryParams,
  ResponseDateRange,
} from "../schemas/response-query-schema";
import {
  FormDefinitionV1,
  formDefinitionV1Schema,
  QuestionDefinition,
} from "@/features/templates/data/definition-v1-schema";

export interface FormResponseSelectorDTO {
  id: string;
  title: string;
  status: FormStatus;
  themeKey: string | null;
  responseCount: number;
  updatedAt: string;
}

export interface ResponseSummaryKPIs {
  totalResponses: number;
  formViews: number;
  completionRate: number | null; // null means "Not tracked yet"
  averageTimeSeconds: number | null; // null means "No timing data"
  lastResponseAt: string | null;
}

export interface ResponseTableColumnDTO {
  id: string;
  label: string;
  type: string;
}

export interface ResponseTableRowDTO {
  id: string;
  rowNumber: number;
  submittedAt: string;
  durationSeconds: number | null;
  previewAnswers: Record<string, string>;
}

export interface TimeSeriesPointDTO {
  dateKey: string;
  label: string;
  count: number;
}

export interface QuestionOptionStatDTO {
  label: string;
  value: string;
  count: number;
  percentage: number;
}

export interface QuestionSummaryDTO {
  questionId: string;
  label: string;
  type: string;
  answeredCount: number;
  distribution?: QuestionOptionStatDTO[];
}

export interface ResponseDetailsDTO {
  id: string;
  rowNumber: number;
  submittedAt: string;
  durationSeconds: number | null;
  answers: {
    questionId: string;
    label: string;
    type: string;
    value: any;
    formattedValue: string;
  }[];
  prevResponseId: string | null;
  nextResponseId: string | null;
}

export interface ResponsesWorkspaceDTO {
  forms: FormResponseSelectorDTO[];
  selectedForm: {
    id: string;
    title: string;
    status: FormStatus;
    themeKey: string | null;
    definition: FormDefinitionV1;
  } | null;
  kpis: ResponseSummaryKPIs;
  displayColumns: ResponseTableColumnDTO[];
  responses: ResponseTableRowDTO[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  timeSeries: TimeSeriesPointDTO[];
  questionSummaries: QuestionSummaryDTO[];
  selectedResponse: ResponseDetailsDTO | null;
}

export async function getResponsesWorkspace(
  params: ResponseWorkspaceQueryParams
): Promise<ResponsesWorkspaceDTO | null> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return null;
  }

  const userId = sessionData.user.id;

  // 1. Fetch all owned forms with response count
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

  const formDTOs: FormResponseSelectorDTO[] = ownedForms.map((f) => ({
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
      kpis: {
        totalResponses: 0,
        formViews: 0,
        completionRate: null,
        averageTimeSeconds: null,
        lastResponseAt: null,
      },
      displayColumns: [],
      responses: [],
      pagination: {
        page: 1,
        pageSize: params.pageSize,
        totalCount: 0,
        totalPages: 0,
      },
      timeSeries: [],
      questionSummaries: [],
      selectedResponse: null,
    };
  }

  // 2. Determine selectedFormId
  let activeFormId = params.formId;
  const isRequestedValid = activeFormId && formDTOs.some((f) => f.id === activeFormId);

  if (!isRequestedValid) {
    // Prefer most recently updated form with responses
    const formWithResponses = formDTOs.find((f) => f.responseCount > 0);
    activeFormId = formWithResponses ? formWithResponses.id : formDTOs[0].id;
  }

  // 3. Fetch full selected form record
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
    return {
      forms: formDTOs,
      selectedForm: null,
      kpis: {
        totalResponses: 0,
        formViews: 0,
        completionRate: null,
        averageTimeSeconds: null,
        lastResponseAt: null,
      },
      displayColumns: [],
      responses: [],
      pagination: {
        page: 1,
        pageSize: params.pageSize,
        totalCount: 0,
        totalPages: 0,
      },
      timeSeries: [],
      questionSummaries: [],
      selectedResponse: null,
    };
  }

  const parsedDef = formDefinitionV1Schema.safeParse(selectedFormRecord.definition);
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

  // Determine display columns: explicit responseListColumn or first 3 non-complex questions
  let displayColumns: ResponseTableColumnDTO[] = questions
    .filter((q) => q.responseListColumn === true)
    .map((q) => ({ id: q.id, label: q.label, type: q.type }));

  if (displayColumns.length === 0) {
    displayColumns = questions
      .filter((q) =>
        ["SHORT_TEXT", "EMAIL", "DROPDOWN", "MULTIPLE_CHOICE", "NUMBER"].includes(q.type)
      )
      .slice(0, 3)
      .map((q) => ({ id: q.id, label: q.label, type: q.type }));
  }

  // 4. Calculate KPIs (truthful, directly from database records)
  const [totalResponses, formViews, latestResponse, avgDurationAgg] =
    await Promise.all([
      prisma.formResponse.count({
        where: { formId: selectedFormRecord.id },
      }),
      prisma.responseSession.count({
        where: { formId: selectedFormRecord.id },
      }),
      prisma.formResponse.findFirst({
        where: { formId: selectedFormRecord.id },
        orderBy: { submittedAt: "desc" },
        select: { submittedAt: true },
      }),
      prisma.formResponse.aggregate({
        where: {
          formId: selectedFormRecord.id,
          durationSeconds: { not: null },
        },
        _avg: {
          durationSeconds: true,
        },
      }),
    ]);

  const completionRate =
    formViews > 0
      ? Math.min(100, Math.round((totalResponses / formViews) * 100))
      : null;

  const averageTimeSeconds =
    avgDurationAgg._avg.durationSeconds !== null
      ? Math.round(avgDurationAgg._avg.durationSeconds)
      : null;

  const lastResponseAt = latestResponse
    ? latestResponse.submittedAt.toISOString()
    : null;

  const kpis: ResponseSummaryKPIs = {
    totalResponses,
    formViews,
    completionRate,
    averageTimeSeconds,
    lastResponseAt,
  };

  // 5. Fetch all submitted responses for server-side aggregation and filtered pagination
  // (Bounded query, safe for Formly response sets)
  const allFormResponses = await prisma.formResponse.findMany({
    where: { formId: selectedFormRecord.id },
    select: {
      id: true,
      submittedAt: true,
      durationSeconds: true,
      answers: true,
      definitionSnapshot: true,
    },
    orderBy: {
      submittedAt: params.sort === "oldest" ? "asc" : "desc",
    },
  });

  // Calculate Time Series
  const timeSeries = computeTimeSeries(allFormResponses, params.dateRange);

  // Calculate Question Summaries and Distributions
  const questionSummaries = computeQuestionSummaries(questions, allFormResponses);

  // Search filtering (by answers preview or submitted date string)
  let filteredResponses = allFormResponses;
  if (params.search && params.search.trim().length > 0) {
    const q = params.search.toLowerCase();
    filteredResponses = allFormResponses.filter((item) => {
      const dateStr = item.submittedAt.toLocaleDateString().toLowerCase();
      if (dateStr.includes(q)) return true;
      if (item.answers && typeof item.answers === "object") {
        const answersObj = item.answers as Record<string, any>;
        return Object.values(answersObj).some((val) =>
          String(val || "").toLowerCase().includes(q)
        );
      }
      return false;
    });
  }

  // Pagination calculation
  const totalCount = filteredResponses.length;
  const totalPages = Math.ceil(totalCount / params.pageSize);
  const clampedPage = Math.max(1, Math.min(params.page, Math.max(1, totalPages)));
  const startIndex = (clampedPage - 1) * params.pageSize;
  const pagedItems = filteredResponses.slice(startIndex, startIndex + params.pageSize);

  // Map table row DTOs
  const tableRows: ResponseTableRowDTO[] = pagedItems.map((item, idx) => {
    const answersObj = (item.answers || {}) as Record<string, any>;
    const previewAnswers: Record<string, string> = {};

    for (const col of displayColumns) {
      const rawVal = answersObj[col.id];
      if (rawVal === undefined || rawVal === null) {
        previewAnswers[col.id] = "-";
      } else if (Array.isArray(rawVal)) {
        previewAnswers[col.id] = rawVal.join(", ");
      } else {
        previewAnswers[col.id] = String(rawVal);
      }
    }

    return {
      id: item.id,
      rowNumber: startIndex + idx + 1,
      submittedAt: item.submittedAt.toISOString(),
      durationSeconds: item.durationSeconds,
      previewAnswers,
    };
  });

  // 6. Selected Response detail pane resolution
  let selectedResponse: ResponseDetailsDTO | null = null;
  const targetResponseId = params.responseId || (params.tab === "individual" && tableRows[0]?.id);

  if (targetResponseId) {
    const targetIdx = filteredResponses.findIndex((r) => r.id === targetResponseId);
    if (targetIdx !== -1) {
      const respRecord = filteredResponses[targetIdx];
      const answersObj = (respRecord.answers || {}) as Record<string, any>;

      // Use snapshot questions if available, fallback to current definition questions
      const snapshotDef = formDefinitionV1Schema.safeParse(respRecord.definitionSnapshot);
      const activeQuestions = snapshotDef.success
        ? snapshotDef.data.questions
        : questions;

      const answerDetails = activeQuestions.map((q) => {
        const rawVal = answersObj[q.id];
        let formattedValue = "-";
        if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
          if (Array.isArray(rawVal)) {
            formattedValue = rawVal.join(", ");
          } else {
            formattedValue = String(rawVal);
          }
        }
        return {
          questionId: q.id,
          label: q.label,
          type: q.type,
          value: rawVal ?? null,
          formattedValue,
        };
      });

      selectedResponse = {
        id: respRecord.id,
        rowNumber: targetIdx + 1,
        submittedAt: respRecord.submittedAt.toISOString(),
        durationSeconds: respRecord.durationSeconds,
        answers: answerDetails,
        prevResponseId: targetIdx > 0 ? filteredResponses[targetIdx - 1].id : null,
        nextResponseId:
          targetIdx < filteredResponses.length - 1
            ? filteredResponses[targetIdx + 1].id
            : null,
      };
    }
  }

  return {
    forms: formDTOs,
    selectedForm: {
      id: selectedFormRecord.id,
      title: selectedFormRecord.title,
      status: selectedFormRecord.status,
      themeKey: selectedFormRecord.themeKey,
      definition: formDefinition,
    },
    kpis,
    displayColumns,
    responses: tableRows,
    pagination: {
      page: clampedPage,
      pageSize: params.pageSize,
      totalCount,
      totalPages,
    },
    timeSeries,
    questionSummaries,
    selectedResponse,
  };
}

function computeTimeSeries(
  responses: { submittedAt: Date }[],
  range: ResponseDateRange
): TimeSeriesPointDTO[] {
  const now = new Date();
  let days = 7;
  if (range === "30d") days = 30;
  if (range === "90d") days = 90;
  if (range === "all") days = 14; // Default span for all-time timeline preview

  const buckets: Record<string, number> = {};
  const dateKeys: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    buckets[key] = 0;
    dateKeys.push(key);
  }

  for (const r of responses) {
    const key = r.submittedAt.toISOString().split("T")[0];
    if (buckets[key] !== undefined) {
      buckets[key]++;
    }
  }

  return dateKeys.map((key) => {
    const dateObj = new Date(key + "T00:00:00Z");
    const label = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    return {
      dateKey: key,
      label,
      count: buckets[key],
    };
  });
}

function computeQuestionSummaries(
  questions: QuestionDefinition[],
  responses: { answers: any }[]
): QuestionSummaryDTO[] {
  return questions.map((q) => {
    let answeredCount = 0;
    const valueCounts: Record<string, number> = {};

    for (const r of responses) {
      const answersObj = (r.answers || {}) as Record<string, any>;
      const val = answersObj[q.id];

      if (val !== undefined && val !== null && val !== "" && !(Array.isArray(val) && val.length === 0)) {
        answeredCount++;

        if (q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN" || q.type === "RATING") {
          const strVal = String(val);
          valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
        } else if (q.type === "CHECKBOX" && Array.isArray(val)) {
          for (const item of val) {
            const strVal = String(item);
            valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
          }
        }
      }
    }

    // Build distributions for choice/rating questions
    if (["MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOX", "RATING"].includes(q.type)) {
      const options = q.options || [];
      const distribution: QuestionOptionStatDTO[] = [];

      if (q.type === "RATING") {
        for (let star = 1; star <= 5; star++) {
          const count = valueCounts[String(star)] || 0;
          const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
          distribution.push({
            label: `${star} Star${star > 1 ? "s" : ""}`,
            value: String(star),
            count,
            percentage,
          });
        }
      } else if (options.length > 0) {
        for (const opt of options) {
          const count = valueCounts[opt.value] || 0;
          const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
          distribution.push({
            label: opt.label,
            value: opt.value,
            count,
            percentage,
          });
        }
      }

      return {
        questionId: q.id,
        label: q.label,
        type: q.type,
        answeredCount,
        distribution,
      };
    }

    return {
      questionId: q.id,
      label: q.label,
      type: q.type,
      answeredCount,
    };
  });
}
