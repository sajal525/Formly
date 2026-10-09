import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import {
  restoreTrashActionSchema,
  permanentDeleteActionSchema,
} from "@/features/trash/schemas/trash-query-schema";
import { restoreTrashedForm } from "@/features/trash/server/restore-trashed-form";
import { permanentlyDeleteTrashedForm } from "@/features/trash/server/permanently-delete-trashed-form";
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
        { error: "Unauthorized. Please sign in to manage trash." },
        { status: 401 }
      );
    }

    const { formId } = await params;
    if (!formId) {
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

    const parseResult = restoreTrashActionSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { restoreAs } = parseResult.data;
    const userId = sessionData.user.id;

    const restored = await restoreTrashedForm(userId, formId, restoreAs);

    if (!restored) {
      return NextResponse.json(
        { error: "Form not found in Trash or action not permitted" },
        { status: 404 }
      );
    }

    revalidatePath("/trash");
    revalidatePath("/my-forms");
    revalidatePath("/dashboard");

    return NextResponse.json({
      form: restored,
      message: `Restored "${restored.title}" successfully`,
    });
  } catch (error) {
    console.error("Error restoring trashed form:", error);
    return NextResponse.json(
      { error: "Failed to restore form. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete forms." },
        { status: 401 }
      );
    }

    const { formId } = await params;
    if (!formId) {
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
      // Allow empty body if no confirmation required, but schema validates
    }

    const parseResult = permanentDeleteActionSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.errors[0]?.message || "Confirmation is required";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { confirmText } = parseResult.data;
    const cleanConfirm = confirmText.trim().toUpperCase();
    if (cleanConfirm !== "DELETE") {
      return NextResponse.json(
        { error: 'Please type "DELETE" to confirm permanent deletion.' },
        { status: 400 }
      );
    }

    const userId = sessionData.user.id;
    const deleted = await permanentlyDeleteTrashedForm(userId, formId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Form not found in Trash or already deleted" },
        { status: 404 }
      );
    }

    revalidatePath("/trash");
    revalidatePath("/my-forms");
    revalidatePath("/dashboard");

    return NextResponse.json({
      success: true,
      message: `Permanently deleted "${deleted.title}"`,
    });
  } catch (error) {
    console.error("Error deleting trashed form:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete form. Please try again." },
      { status: 500 }
    );
  }
}
