import { NextRequest, NextResponse } from "next/server";
import { startResponseSession } from "@/features/responses/server/public-form-service";
import { publicSessionStartSchema } from "@/features/responses/schemas/public-submission-schema";

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

    let sessionHash: string | undefined;
    let sourceKey: string | undefined = req.nextUrl.searchParams.get("src") || undefined;

    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        const body = JSON.parse(text);
        const parsed = publicSessionStartSchema.safeParse(body);
        if (parsed.success) {
          sessionHash = parsed.data.sessionHash;
          if (parsed.data.sourceKey) {
            sourceKey = parsed.data.sourceKey;
          }
        }
      }
    } catch {
      // Body is optional for session start
    }

    const userAgent = req.headers.get("user-agent");

    const session = await startResponseSession(formId, {
      sessionHash,
      userAgent,
      sourceKey,
    });
    if (!session) {
      return NextResponse.json(
        { error: "Form not found or is currently closed to new responses." },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error starting form session:", error);
    return NextResponse.json(
      { error: "Failed to initialize form session." },
      { status: 500 }
    );
  }
}
