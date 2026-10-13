import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { notificationQuerySchema } from "@/features/notifications/schemas/notification-schema";
import { getNotificationsForUser } from "@/features/notifications/server/notification-service";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const rawFilter = searchParams.get("filter") || "all";
    const rawLimit = searchParams.get("limit") || "20";
    const rawCursor = searchParams.get("cursor") || undefined;

    const parsedQuery = notificationQuerySchema.safeParse({
      filter: rawFilter,
      limit: rawLimit,
      cursor: rawCursor,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const result = await getNotificationsForUser(
      sessionData.user.id,
      parsedQuery.data
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error fetching notifications" },
      { status: 500 }
    );
  }
}
