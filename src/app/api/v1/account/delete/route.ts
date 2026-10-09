import { NextRequest, NextResponse } from "next/server";
import { deleteCurrentAccount } from "@/features/profile/server/delete-account";

export async function POST(req: NextRequest) {
  try {
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

    const result = await deleteCurrentAccount(bodyData as any);
    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: "Account and data deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete account route:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}
