import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { createDraftFromTemplate } from "@/features/templates/server/use-template";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData || !sessionData.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use templates." },
        { status: 401 }
      );
    }

    const { templateId } = await params;
    if (!templateId || templateId.trim().length === 0) {
      return NextResponse.json(
        { error: "Template ID is required." },
        { status: 400 }
      );
    }

    const newForm = await createDraftFromTemplate(
      sessionData.user.id,
      templateId.trim()
    );

    // Revalidate library screens
    revalidatePath("/my-forms");
    revalidatePath("/dashboard");

    return NextResponse.json(
      {
        form: newForm,
        message: "Draft form created successfully from template.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating form from template:", error);
    const message =
      error?.message || "Failed to create draft form from template.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
