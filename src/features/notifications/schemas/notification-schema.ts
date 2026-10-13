import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "FORM_RESPONSE",
  "COLLABORATOR_INVITATION",
  "FORM_ACTIVITY",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationFilterSchema = z.enum(["all", "unread"]).default("all");
export type NotificationFilter = z.infer<typeof notificationFilterSchema>;

export const notificationQuerySchema = z.object({
  filter: notificationFilterSchema,
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  formId: string | null;
  responseId: string | null;
  invitationId: string | null;
  readAt: string | null;
  createdAt: string;
  targetHref: string | null;
}

export interface NotificationListResponse {
  notifications: NotificationDTO[];
  unreadCount: number;
  nextCursor: string | null;
}
