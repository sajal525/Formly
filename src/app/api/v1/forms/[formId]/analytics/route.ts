import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { getFormAnalytics } from "@/features/analytics/server/get-form-analytics";
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
        { error: "Unauthorized. Please sign in to view analytics." },
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
      return NextResponse.json(
        { error: "Invalid analytics parameters" },
        { status: 400 }
      );
    }

    const data = await getFormAnalytics(parsed.data);
    if (!data) {
      return NextResponse.json(
        { error: "Form not found or you do not have permission to view its analytics." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching form analytics:", error);
    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 }
    );
  }
}
