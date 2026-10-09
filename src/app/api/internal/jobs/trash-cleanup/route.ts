import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredTrash } from "@/features/trash/server/purge-expired-trash";

export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "Cron secret is not configured on the server." },
        { status: 503 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const customHeader = req.headers.get("x-cron-secret");

    let providedSecret = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      providedSecret = authHeader.slice(7).trim();
    } else if (customHeader) {
      providedSecret = customHeader.trim();
    }

    if (!providedSecret || providedSecret !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Valid cron secret required." },
        { status: 401 }
      );
    }

    const result = await purgeExpiredTrash(50);

    return NextResponse.json({
      success: true,
      purgedCount: result.purgedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in trash-cleanup job:", error);
    return NextResponse.json(
      { error: "Internal error processing trash cleanup." },
      { status: 500 }
    );
  }
}
