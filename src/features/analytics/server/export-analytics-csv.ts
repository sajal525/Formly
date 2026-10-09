import "server-only";
import { getFormAnalytics, FormAnalyticsDTO } from "./get-form-analytics";
import { AnalyticsQueryParams } from "../schemas/analytics-query-schema";

function sanitizeCsvCell(value: any): string {
  if (value === undefined || value === null) {
    return '""';
  }
  let str = Array.isArray(value) ? value.join("; ") : String(value);

  // OWASP CSV Injection mitigation
  if (/^[=+\-@\t\r\n]/.test(str)) {
    str = `'${str}`;
  }

  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function generateAnalyticsCsv(
  params: AnalyticsQueryParams
): Promise<{ filename: string; csvContent: string } | null> {
  const data = await getFormAnalytics(params);
  if (!data || !data.selectedForm) {
    return null;
  }

  const form = data.selectedForm;
  const rows: string[] = [];

  // Report Title & Metadata
  rows.push([sanitizeCsvCell("FORMLY ANALYTICS REPORT")].join(","));
  rows.push([sanitizeCsvCell("Form Title:"), sanitizeCsvCell(form.title)].join(","));
  rows.push([sanitizeCsvCell("Date Range:"), sanitizeCsvCell(data.rangeLabel)].join(","));
  rows.push([
    sanitizeCsvCell("Period Dates:"),
    sanitizeCsvCell(`${data.startDate.split("T")[0]} to ${data.endDate.split("T")[0]}`),
  ].join(","));
  rows.push([sanitizeCsvCell("Generated At:"), sanitizeCsvCell(new Date().toISOString())].join(","));
  rows.push([sanitizeCsvCell("Timezone:"), sanitizeCsvCell(data.timezone)].join(","));
  rows.push(""); // empty row

  // Section 1: KPI Metrics
  rows.push([sanitizeCsvCell("=== KEY PERFORMANCE INDICATORS ===")].join(","));
  rows.push([
    sanitizeCsvCell("Metric"),
    sanitizeCsvCell("Value"),
    sanitizeCsvCell("Comparison vs Prior Period"),
    sanitizeCsvCell("Description"),
  ].join(","));

  const kpis = [
    data.kpis.responses,
    data.kpis.views,
    data.kpis.completionRate,
    data.kpis.averageTime,
    data.kpis.startedForms,
  ];

  kpis.forEach((kpi) => {
    rows.push([
      sanitizeCsvCell(kpi.label),
      sanitizeCsvCell(kpi.value),
      sanitizeCsvCell(kpi.deltaText || "N/A"),
      sanitizeCsvCell(kpi.tooltip),
    ].join(","));
  });
  rows.push("");

  // Section 2: Daily Activity
  rows.push([sanitizeCsvCell("=== DAILY ACTIVITY (VIEWS VS RESPONSES) ===")].join(","));
  rows.push([
    sanitizeCsvCell("Date"),
    sanitizeCsvCell("Qualified Views"),
    sanitizeCsvCell("Completed Submissions"),
  ].join(","));

  data.timeSeries.forEach((pt) => {
    rows.push([
      sanitizeCsvCell(pt.dateKey),
      sanitizeCsvCell(pt.views),
      sanitizeCsvCell(pt.responses),
    ].join(","));
  });
  rows.push("");

  // Section 3: Device Mix
  rows.push([sanitizeCsvCell("=== DEVICE DISTRIBUTION ===")].join(","));
  rows.push([
    sanitizeCsvCell("Device Type"),
    sanitizeCsvCell("Sessions Count"),
    sanitizeCsvCell("Percentage"),
  ].join(","));

  data.deviceDistribution.forEach((dev) => {
    rows.push([
      sanitizeCsvCell(dev.name),
      sanitizeCsvCell(dev.count),
      sanitizeCsvCell(`${dev.percentage}%`),
    ].join(","));
  });
  rows.push("");

  // Section 4: Submission Source
  rows.push([sanitizeCsvCell("=== SUBMISSION SOURCES ===")].join(","));
  rows.push([
    sanitizeCsvCell("Traffic Channel"),
    sanitizeCsvCell("Sessions Count"),
    sanitizeCsvCell("Percentage"),
  ].join(","));

  data.sourceDistribution.forEach((src) => {
    rows.push([
      sanitizeCsvCell(src.name),
      sanitizeCsvCell(src.count),
      sanitizeCsvCell(`${src.percentage}%`),
    ].join(","));
  });
  rows.push("");

  // Section 5: Completion Funnel
  rows.push([sanitizeCsvCell("=== RESPONSE COMPLETION FUNNEL ===")].join(","));
  rows.push([
    sanitizeCsvCell("Stage"),
    sanitizeCsvCell("Qualified Count"),
    sanitizeCsvCell("Cohort Conversion Rate"),
    sanitizeCsvCell("Stage Description"),
  ].join(","));

  data.funnel.forEach((st) => {
    rows.push([
      sanitizeCsvCell(st.stage),
      sanitizeCsvCell(st.count),
      sanitizeCsvCell(`${st.percentage}%`),
      sanitizeCsvCell(st.description),
    ].join(","));
  });
  rows.push("");

  // Section 6: Question Analysis
  rows.push([sanitizeCsvCell("=== QUESTION-WISE ANSWER DISTRIBUTIONS ===")].join(","));
  data.questionAnalysis.forEach((qa, idx) => {
    rows.push([
      sanitizeCsvCell(`Q${idx + 1}: ${qa.label}`),
      sanitizeCsvCell(`Total Answers: ${qa.totalAnswers}`),
      sanitizeCsvCell(`Type: ${qa.type}`),
    ].join(","));

    if (qa.options.length > 0) {
      qa.options.forEach((opt) => {
        rows.push([
          sanitizeCsvCell(`  - ${opt.label}`),
          sanitizeCsvCell(opt.count),
          sanitizeCsvCell(`${opt.percentage}%`),
        ].join(","));
      });
    }
  });

  const cleanTitle = form.title
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 30);
  const filename = `analytics-report-${cleanTitle || "form"}-${new Date().toISOString().slice(0, 10)}.csv`;
  const csvContent = "\uFEFF" + rows.join("\r\n");

  return { filename, csvContent };
}
