import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { generateAnalyticsCsv } from "@/features/analytics/server/export-analytics-csv";
import { analyticsQuerySchema } from "@/features/analytics/schemas/analytics-query-schema";

interface RouteParams {
  params: Promise<{
    formId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to export analytics report." },
        { status: 401 }
      );
    }

    const { formId } = await params;
    const url = req.nextUrl;

    const parsed = analyticsQuerySchema.safeParse({
      formId,
      range: url.searchParams.get("range") || "30d",
      from: url.searchParams.get("from") || undefined,
      to: url.searchParams.get("to") || undefined,
      timezone: url.searchParams.get("timezone") || "UTC",
      compare: url.searchParams.get("compare") || "previous",
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const exportData = await generateAnalyticsCsv(parsed.data);
    if (!exportData) {
      return NextResponse.json(
        { error: "Form not found or you do not have permission to export its report." },
        { status: 404 }
      );
    }

    return new Response(exportData.csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportData.filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error exporting analytics report:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics export." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to export analytics report." },
        { status: 401 }
      );
    }

    const { formId } = await params;
    let bodyData: any = {};
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        bodyData = JSON.parse(text);
      }
    } catch {
      // Body optional
    }

    const parsed = analyticsQuerySchema.safeParse({
      formId,
      range: bodyData.range || "30d",
      from: bodyData.from,
      to: bodyData.to,
      timezone: bodyData.timezone || "UTC",
      compare: bodyData.compare || "previous",
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const exportData = await generateAnalyticsCsv(parsed.data);
    if (!exportData) {
      return NextResponse.json(
        { error: "Form not found or you do not have permission to export its report." },
        { status: 404 }
      );
    }

    return new Response(exportData.csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportData.filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error exporting analytics report:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics export." },
      { status: 500 }
    );
  }
}
