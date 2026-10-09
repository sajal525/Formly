import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { bulkTrashActionSchema } from "@/features/trash/schemas/trash-query-schema";
import { bulkRestoreTrashedForms } from "@/features/trash/server/restore-trashed-form";
import { bulkPermanentlyDeleteTrashedForms } from "@/features/trash/server/permanently-delete-trashed-form";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to perform trash actions." },
        { status: 401 }
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

    const parseResult = bulkTrashActionSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { action, formIds, confirmText } = parseResult.data;
    const userId = sessionData.user.id;

    if (action === "delete_permanently") {
      const cleanConfirm = (confirmText || "").trim().toUpperCase();
      if (cleanConfirm !== "DELETE") {
        return NextResponse.json(
          { error: 'Please type "DELETE" to confirm permanent deletion.' },
          { status: 400 }
        );
      }

      const count = await bulkPermanentlyDeleteTrashedForms(userId, formIds);
      revalidatePath("/trash");
      revalidatePath("/my-forms");
      revalidatePath("/dashboard");

      return NextResponse.json({
        count,
        message: `Permanently deleted ${count} form${count === 1 ? "" : "s"}`,
      });
    } else {
      const count = await bulkRestoreTrashedForms(userId, formIds);
      revalidatePath("/trash");
      revalidatePath("/my-forms");
      revalidatePath("/dashboard");

      return NextResponse.json({
        count,
        message: `Restored ${count} form${count === 1 ? "" : "s"} successfully`,
      });
    }
  } catch (error) {
    console.error("Error performing bulk trash action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action. Please try again." },
      { status: 500 }
    );
  }
}
