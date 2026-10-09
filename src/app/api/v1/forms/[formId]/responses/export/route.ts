import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { generateResponsesCsv } from "@/features/responses/server/export-responses-csv";

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
        { error: "Unauthorized. Please sign in to export responses." },
        { status: 401 }
      );
    }

    const { formId } = await params;
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const selectedIdsParam = searchParams.get("selectedIds");
    const selectedIds = selectedIdsParam ? selectedIdsParam.split(",").filter(Boolean) : undefined;

    const exportData = await generateResponsesCsv(formId, selectedIds);
    if (!exportData) {
      return NextResponse.json(
        { error: "Form not found or you do not have permission to export its responses." },
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
    console.error("Error exporting responses CSV:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV export." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to export responses." },
        { status: 401 }
      );
    }

    const { formId } = await params;
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    let selectedIds: string[] | undefined;
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        const body = JSON.parse(text);
        if (Array.isArray(body.selectedResponseIds)) {
          selectedIds = body.selectedResponseIds;
        }
      }
    } catch {
      // Body is optional
    }

    const exportData = await generateResponsesCsv(formId, selectedIds);
    if (!exportData) {
      return NextResponse.json(
        { error: "Form not found or you do not have permission to export its responses." },
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
    console.error("Error exporting responses CSV:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV export." },
      { status: 500 }
    );
  }
}
