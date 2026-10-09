import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { getTemplatePreview } from "@/features/templates/server/get-template-preview";

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData || !sessionData.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view templates." },
        { status: 401 }
      );
    }

    const { templateId } = await params;
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required." },
        { status: 400 }
      );
    }

    const preview = await getTemplatePreview(templateId.trim());
    if (!preview) {
      return NextResponse.json(
        { error: "Template not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ template: preview });
  } catch (error: any) {
    console.error("Error retrieving template preview:", error);
    return NextResponse.json(
      { error: "Failed to load template preview." },
      { status: 500 }
    );
  }
}
