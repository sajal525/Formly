import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  BuilderFormDefinition,
  PublishFormResponse,
  builderFormDefinitionSchema,
} from "../schemas/builder-definition-schema";

export async function publishForm(
  userId: string,
  formId: string
): Promise<PublishFormResponse> {
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: {
      id: true,
      title: true,
      status: true,
      definition: true,
    },
  });

  if (!form) {
    return { success: false, error: "Form not found" };
  }

  if (form.status === FormStatus.PUBLISHED) {
    return {
      success: true,
      formId: form.id,
      publicUrl: `/f/${form.id}`,
    };
  }

  // Parse and validate definition
  const parsed = builderFormDefinitionSchema.safeParse(form.definition);
  if (!parsed.success) {
    return {
      success: false,
      error: "Form definition is incomplete or invalid.",
      validationErrors: parsed.error.errors.map((e) => e.message),
    };
  }

  const definition: BuilderFormDefinition = parsed.data;
  const validationErrors: string[] = [];

  if (!definition.title.trim()) {
    validationErrors.push("Form must have a valid title.");
  }

  if (!definition.questions || definition.questions.length === 0) {
    validationErrors.push("Form must contain at least one question before publishing.");
  }

  definition.questions.forEach((q, idx) => {
    if (!q.label || !q.label.trim()) {
      validationErrors.push(`Question #${idx + 1} must have a title.`);
    }
    if (
      (q.type === "MULTIPLE_CHOICE" ||
        q.type === "CHECKBOX" ||
        q.type === "DROPDOWN") &&
      (!q.options || q.options.length === 0)
    ) {
      validationErrors.push(`Question #${idx + 1} (${q.type}) must have at least one choice option.`);
    }
  });

  if (validationErrors.length > 0) {
    return {
      success: false,
      error: "Please fix all validation issues before publishing.",
      validationErrors,
    };
  }

  // Atomically update form to PUBLISHED
  await prisma.form.update({
    where: { id: formId },
    data: {
      status: FormStatus.PUBLISHED,
      themeKey: definition.themeKey,
      definitionVersion: 1,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/f/${formId}`);
  revalidatePath("/dashboard");
  revalidatePath("/my-forms");

  return {
    success: true,
    formId,
    publicUrl: `/f/${formId}`,
  };
}
