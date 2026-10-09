import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { manageFormActionSchema } from "@/features/forms/schemas/form-management-schema";
import {
  renameForm,
  archiveForm,
  restoreForm,
  publishForm,
  closeForm,
  trashForm,
} from "@/features/forms/server/manage-form";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{
    formId: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to manage forms." },
        { status: 401 }
      );
    }

    const { formId } = await params;
    if (!formId || typeof formId !== "string") {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      );
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

    const parseResult = manageFormActionSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const actionData = parseResult.data;
    const userId = sessionData.user.id;

    let result = null;
    let message = "";

    if (actionData.action === "rename") {
      result = await renameForm(userId, formId, actionData.title);
      message = "Form renamed successfully";
    } else if (actionData.action === "archive") {
      result = await archiveForm(userId, formId);
      message = "Form archived successfully";
    } else if (actionData.action === "restore") {
      result = await restoreForm(userId, formId);
      message = "Form restored successfully";
    } else if (actionData.action === "publish") {
      result = await publishForm(userId, formId);
      message = "Form published successfully";
    } else if (actionData.action === "close") {
      result = await closeForm(userId, formId);
      message = "Form closed successfully";
    } else if (actionData.action === "trash") {
      result = await trashForm(userId, formId);
      message = "Form moved to Trash";
    }

    if (!result) {
      return NextResponse.json(
        { error: "Form not found or action not permitted" },
        { status: 404 }
      );
    }

    revalidatePath("/my-forms");
    revalidatePath("/dashboard");
    revalidatePath("/trash");

    return NextResponse.json({
      form: result,
      message,
    });
  } catch (error) {
    console.error("Error managing form:", error);
    return NextResponse.json(
      { error: "Failed to perform action. Please try again." },
      { status: 500 }
    );
  }
}
