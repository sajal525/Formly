import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { aiImportRequestSchema } from "@/features/builder/schemas/ai-import-schema";
import { extractQuestionsFromText } from "@/features/builder/server/ai-form-extractor";

interface RouteParams {
  params: Promise<{
    formId: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parseResult = aiImportRequestSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { text } = parseResult.data;

    const result = await extractQuestionsFromText(text);

    if (!result.questions || result.questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No questions could be extracted from the provided text. Please provide structured text, a list of questions, or try one of the sample templates.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        questions: result.questions,
        detectedCount: result.detectedCount,
        suggestedTitle: result.suggestedTitle,
        suggestedDescription: result.suggestedDescription,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI import extraction error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to generate questions with AI. Please check your text and try again." },
      { status: 500 }
    );
  }
}
