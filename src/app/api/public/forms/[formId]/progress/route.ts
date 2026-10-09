import { NextRequest, NextResponse } from "next/server";
import { recordSessionProgress } from "@/features/responses/server/public-form-service";
import { publicProgressPayloadSchema } from "@/features/responses/schemas/public-submission-schema";

interface RouteParams {
  params: Promise<{
    formId: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { formId } = await params;
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    let bodyData: unknown = {};
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        bodyData = JSON.parse(text);
      }
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = publicProgressPayloadSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Invalid progress payload";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { sessionId, milestone } = parseResult.data;
    const result = await recordSessionProgress(formId, sessionId, milestone);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error recording progress milestone:", error);
    return NextResponse.json(
      { error: "Failed to record session milestone" },
      { status: 500 }
    );
  }
}
