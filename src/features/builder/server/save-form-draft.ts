import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import {
  SaveDraftRequest,
  SaveDraftResponse,
  saveDraftRequestSchema,
} from "../schemas/builder-definition-schema";

export async function saveFormDraft(
  userId: string,
  formId: string,
  input: SaveDraftRequest
): Promise<SaveDraftResponse> {
  const parsed = saveDraftRequestSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors[0]?.message || "Invalid form definition";
    return { success: false, error: errorMsg };
  }

  const { definition, expectedRevision } = parsed.data;

  // Retrieve current form to verify ownership and revision
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: {
      id: true,
      status: true,
      draftRevision: true,
    },
  });

  if (!existing) {
    return { success: false, error: "Form not found or inaccessible" };
  }

  if (existing.status !== FormStatus.DRAFT) {
    return {
      success: false,
      error: `Form cannot be autosaved because its status is ${existing.status}. Only DRAFT forms can be saved in this mode.`,
    };
  }

  // Optimistic concurrency check
  if (
    expectedRevision !== undefined &&
    expectedRevision !== existing.draftRevision
  ) {
    return {
      success: false,
      conflict: true,
      currentRevision: existing.draftRevision,
      error: "This form was updated in another tab or device. Please reload the latest revision.",
    };
  }

  const newRevision = existing.draftRevision + 1;
  const newTitle = definition.title.trim() || "Untitled form";
  const newDescription = definition.description?.trim() || null;
  const newThemeKey = definition.themeKey || "soft-lavender";

  const updated = await prisma.form.update({
    where: { id: formId },
    data: {
      title: newTitle,
      description: newDescription,
      themeKey: newThemeKey,
      draftRevision: newRevision,
      definition: definition as any,
      updatedAt: new Date(),
    },
    select: {
      draftRevision: true,
      updatedAt: true,
    },
  });

  return {
    success: true,
    newRevision: updated.draftRevision,
    updatedAt: updated.updatedAt.toISOString(),
  };
}
