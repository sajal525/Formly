import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { createFormSchema } from "@/features/forms/schemas/create-form-schema";
import { createBlankForm } from "@/features/forms/server/create-form";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData || !sessionData.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to create forms." },
        { status: 401 }
      );
    }

    let bodyData = {};
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

    const parseResult = createFormSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const newForm = await createBlankForm(sessionData.user.id, parseResult.data);

    // Revalidate dashboard and my-forms so the latest forms appear immediately
    revalidatePath("/dashboard");
    revalidatePath("/my-forms");

    return NextResponse.json(
      { form: newForm, message: "Draft form created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating draft form:", error);
    return NextResponse.json(
      { error: "Failed to create draft form. Please try again." },
      { status: 500 }
    );
  }
}
