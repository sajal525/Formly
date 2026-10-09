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

  const newTitle = definition.title.trim() || "Untitled form";
  const newDescription = definition.description?.trim() || null;
  const newThemeKey = definition.themeKey || "soft-lavender";
  const now = new Date();

  // 1. Attempt fast single-round-trip atomic update
  const whereCondition: any = {
    id: formId,
    ownerId: userId,
    status: { notIn: [FormStatus.TRASHED, FormStatus.ARCHIVED] },
  };

  if (expectedRevision !== undefined) {
    whereCondition.draftRevision = expectedRevision;
  }

  const updateResult = await prisma.form.updateMany({
    where: whereCondition,
    data: {
      title: newTitle,
      description: newDescription,
      themeKey: newThemeKey,
      draftRevision: { increment: 1 },
      definition: definition as any,
      updatedAt: now,
    },
  });

  if (updateResult.count === 1) {
    // Successfully saved in a single database round-trip
    return {
      success: true,
      newRevision: expectedRevision !== undefined ? expectedRevision + 1 : 1,
      updatedAt: now.toISOString(),
    };
  }

  // 2. Fallback diagnostic query: Only executed when atomic update matched 0 rows (conflict, archived, or not found)
  const existing = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
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

  if (existing.status === FormStatus.TRASHED || existing.status === FormStatus.ARCHIVED) {
    return {
      success: false,
      error: `Form cannot be autosaved because its status is ${existing.status}.`,
    };
  }

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

  return { success: false, error: "Failed to save draft changes." };
}
