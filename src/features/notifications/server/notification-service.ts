import "server-only";

import { prisma } from "@/lib/db";
import { Prisma, NotificationType } from "@prisma/client";
import {
  NotificationDTO,
  NotificationListResponse,
  NotificationQueryInput,
} from "../schemas/notification-schema";

export interface CreateNotificationParams {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  eventKey?: string | null;
  formId?: string | null;
  responseId?: string | null;
  invitationId?: string | null;
  actorId?: string | null;
}

export function buildTargetHref(
  type: NotificationType,
  formId: string | null,
  responseId: string | null
): string | null {
  if (!formId) return null;

  switch (type) {
    case "FORM_RESPONSE":
      if (responseId) {
        return `/responses?formId=${encodeURIComponent(formId)}&responseId=${encodeURIComponent(responseId)}&tab=individual`;
      }
      return `/responses?formId=${encodeURIComponent(formId)}`;
    case "FORM_ACTIVITY":
    case "COLLABORATOR_INVITATION":
      return `/forms/${encodeURIComponent(formId)}/edit`;
    default:
      return `/forms/${encodeURIComponent(formId)}/edit`;
  }
}

export async function createNotification(
  params: CreateNotificationParams,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;

  const data: Prisma.NotificationCreateInput = {
    user: { connect: { id: params.userId } },
    type: params.type || "FORM_RESPONSE",
    title: params.title.trim().slice(0, 200),
    message: params.message.trim().slice(0, 500),
    eventKey: params.eventKey || null,
    actorId: params.actorId || null,
    invitationId: params.invitationId || null,
  };

  if (params.formId) {
    data.form = { connect: { id: params.formId } };
  }
  if (params.responseId) {
    data.response = { connect: { id: params.responseId } };
  }

  if (params.eventKey) {
    // Idempotent upsert by (userId, eventKey)
    try {
      await db.notification.upsert({
        where: {
          userId_eventKey: {
            userId: params.userId,
            eventKey: params.eventKey,
          },
        },
        create: data,
        update: {}, // No-op if already created
      });
    } catch (err) {
      console.error("Failed to create idempotent notification:", err);
    }
  } else {
    try {
      await db.notification.create({ data });
    } catch (err) {
      console.error("Failed to create notification:", err);
    }
  }
}

export async function getNotificationsForUser(
  userId: string,
  query: NotificationQueryInput
): Promise<NotificationListResponse> {
  const limit = Math.min(Math.max(1, query.limit || 20), 50);

  const where: Prisma.NotificationWhereInput = {
    userId,
    ...(query.filter === "unread" ? { readAt: null } : {}),
  };

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        formId: true,
        responseId: true,
        invitationId: true,
        readAt: true,
        createdAt: true,
        form: {
          select: {
            id: true,
            status: true,
            title: true,
          },
        },
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    }),
  ]);

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    if (nextItem) {
      nextCursor = nextItem.id;
    }
  }

  const notifications: NotificationDTO[] = items.map((item) => {
    const isTrashedOrMissing = Boolean(
      item.formId && (!item.form || item.form.status === "TRASHED")
    );

    return {
      id: item.id,
      type: item.type as NotificationDTO["type"],
      title: item.title,
      message: item.message,
      formId: item.formId,
      responseId: item.responseId,
      invitationId: item.invitationId,
      readAt: item.readAt ? item.readAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      targetHref: isTrashedOrMissing
        ? null
        : buildTargetHref(item.type, item.formId, item.responseId),
      destinationUnavailable: isTrashedOrMissing,
    };
  });

  return {
    notifications,
    unreadCount,
    nextCursor,
  };
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<{ success: boolean; unreadCount: number }> {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });

  return { success: true, unreadCount };
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; unreadCount: number }> {
  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return { success: true, unreadCount: 0 };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}
