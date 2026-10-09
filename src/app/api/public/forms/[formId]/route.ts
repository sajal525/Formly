import { NextRequest, NextResponse } from "next/server";
import { getPublicFormData } from "@/features/responses/server/public-form-service";

interface RouteParams {
  params: Promise<{
    formId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { formId } = await params;
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    const data = await getPublicFormData(formId);
    if (!data) {
      return NextResponse.json(
        { error: "Form not found or is currently closed to new responses." },
        { status: 404 }
      );
    }

    return NextResponse.json({ form: data });
  } catch (error) {
    console.error("Error fetching public form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
