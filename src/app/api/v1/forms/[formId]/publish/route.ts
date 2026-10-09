import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { publishForm } from "@/features/builder/server/publish-form";

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

    const result = await publishForm(sessionData.user.id, formId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          validationErrors: result.validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error publishing form:", error);
    return NextResponse.json(
      { error: "Failed to publish form. Please try again." },
      { status: 500 }
    );
  }
}
