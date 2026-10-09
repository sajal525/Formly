import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth-dal";
import { FormStatus } from "@prisma/client";
import {
  FormDefinitionV1,
  formDefinitionV1Schema,
} from "@/features/templates/data/definition-v1-schema";

/**
 * Sanitizes a cell value to prevent CSV / Formula Injection attacks (OWASP)
 * Escapes quotes and prefixes formula trigger characters with a single quote.
 */
function sanitizeCsvCell(value: any): string {
  if (value === undefined || value === null) {
    return '""';
  }

  let str = Array.isArray(value) ? value.join("; ") : String(value);

  // OWASP CSV Injection mitigation:
  // If the cell begins with =, +, -, @, tab, CR, or LF, prepend a single quote (')
  if (/^[=+\-@\t\r\n]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function generateResponsesCsv(
  formId: string,
  selectedResponseIds?: string[]
): Promise<{ filename: string; csvContent: string } | null> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return null;
  }

  const userId = sessionData.user.id;

  // 1. Verify ownership of the form
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: {
      id: true,
      title: true,
      definition: true,
    },
  });

  if (!form) {
    return null;
  }

  const parsedDef = formDefinitionV1Schema.safeParse(form.definition);
  const definition: FormDefinitionV1 = parsedDef.success
    ? parsedDef.data
    : {
        schemaVersion: 1,
        title: form.title,
        description: null,
        themeKey: "default",
        questions: [],
      };

  const questions = definition.questions || [];

  // 2. Query responses for this owned form
  const whereClause: any = {
    formId: form.id,
  };

  if (selectedResponseIds && selectedResponseIds.length > 0) {
    whereClause.id = { in: selectedResponseIds };
  }

  const responses = await prisma.formResponse.findMany({
    where: whereClause,
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      submittedAt: true,
      durationSeconds: true,
      answers: true,
    },
  });

  // 3. Build CSV headers
  const headers = [
    "#",
    "Submitted At (UTC)",
    "Duration (Seconds)",
    ...questions.map((q) => q.label),
  ];

  const csvRows: string[] = [];
  csvRows.push(headers.map(sanitizeCsvCell).join(","));

  // 4. Build CSV data rows
  responses.forEach((resp, idx) => {
    const answersObj = (resp.answers || {}) as Record<string, any>;
    const rowValues = [
      idx + 1,
      resp.submittedAt.toISOString(),
      resp.durationSeconds ?? "",
      ...questions.map((q) => answersObj[q.id] ?? ""),
    ];
    csvRows.push(rowValues.map(sanitizeCsvCell).join(","));
  });

  // Safe filename
  const cleanTitle = form.title
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const filename = `${cleanTitle || "responses"}-${new Date().toISOString().slice(0, 10)}.csv`;

  // Prepend UTF-8 BOM so Excel opens UTF-8 text cleanly
  const csvContent = "\uFEFF" + csvRows.join("\r\n");

  return {
    filename,
    csvContent,
  };
}
