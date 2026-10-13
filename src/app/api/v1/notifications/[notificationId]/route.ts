import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-dal";
import { markNotificationAsRead } from "@/features/notifications/server/notification-service";

interface RouteParams {
  params: Promise<{ notificationId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await params;
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const result = await markNotificationAsRead(
      sessionData.user.id,
      notificationId
    );

    return NextResponse.json({
      success: true,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("Error updating notification read state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
