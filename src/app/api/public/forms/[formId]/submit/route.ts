import { NextRequest, NextResponse } from "next/server";
import { submitFormResponse } from "@/features/responses/server/public-form-service";
import { publicSubmitPayloadSchema } from "@/features/responses/schemas/public-submission-schema";

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

    const parseResult = publicSubmitPayloadSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Invalid submission format";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const result = await submitFormResponse(formId, parseResult.data);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Submission failed" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      responseId: result.responseId,
      message: "Response recorded successfully.",
      confirmationType: result.confirmationType,
      confirmationTitle: result.confirmationTitle,
      confirmationMessage: result.confirmationMessage,
      customPageTitle: result.customPageTitle,
      customPageDescription: result.customPageDescription,
      redirectUrl: result.redirectUrl,
      allowMultipleSubmissions: result.allowMultipleSubmissions,
    });

    if (result.allowMultipleSubmissions === false) {
      response.cookies.set(`formly_submitted_${formId}`, "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Failed to record response. Please try again." },
      { status: 500 }
    );
  }
}
