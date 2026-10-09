import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { bulkFormActionSchema } from "@/features/forms/schemas/form-management-schema";
import { bulkArchiveForms, bulkTrashForms } from "@/features/forms/server/manage-form";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to perform bulk actions." },
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

    const parseResult = bulkFormActionSchema.safeParse(bodyData);
    if (!parseResult.success) {
      const firstError =
        parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { action, formIds } = parseResult.data;
    const userId = sessionData.user.id;

    let count = 0;
    let message = "";

    if (action === "archive") {
      count = await bulkArchiveForms(userId, formIds);
      message = `Successfully archived ${count} form${count === 1 ? "" : "s"}`;
    } else if (action === "trash") {
      count = await bulkTrashForms(userId, formIds);
      message = `Successfully moved ${count} form${count === 1 ? "" : "s"} to Trash`;
    }

    revalidatePath("/my-forms");
    revalidatePath("/dashboard");
    revalidatePath("/trash");

    return NextResponse.json({
      count,
      message,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action. Please try again." },
      { status: 500 }
    );
  }
}
