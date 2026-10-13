import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { markAllNotificationsAsRead } from "@/features/notifications/server/notification-service";

export async function POST(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await markAllNotificationsAsRead(sessionData.user.id);

    return NextResponse.json({
      success: true,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
