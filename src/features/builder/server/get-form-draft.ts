import "server-only";
import { prisma } from "@/lib/db";
import { FormStatus } from "@prisma/client";
import {
  BuilderFormDefinition,
  builderFormDefinitionSchema,
  formSettingsSchema,
} from "../schemas/builder-definition-schema";

export interface FormDraftDTO {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  themeKey: string;
  draftRevision: number;
  definition: BuilderFormDefinition;
  updatedAt: string;
}

export async function getFormDraft(
  userId: string,
  formId: string
): Promise<FormDraftDTO | null> {
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      ownerId: userId,
      status: { not: FormStatus.TRASHED },
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      themeKey: true,
      draftRevision: true,
      definition: true,
      updatedAt: true,
    },
  });

  if (!form) {
    return null;
  }

  // Parse existing definition or synthesize valid default definition
  const parsed = builderFormDefinitionSchema.safeParse(form.definition);
  let definition: BuilderFormDefinition;

  if (parsed.success) {
    definition = parsed.data;
  } else {
    definition = {
      schemaVersion: 1,
      title: form.title || "Untitled form",
      description: form.description || null,
      themeKey: form.themeKey || "soft-lavender",
      settings: formSettingsSchema.parse({
        showProgressIndicator: true,
        confirmationMessage: "Thanks for your response.",
        allowMultipleSubmissions: true,
      }),
      questions: [
        {
          id: `q-${Date.now()}`,
          type: "SHORT_TEXT",
          label: "Untitled question",
          description: null,
          required: false,
          settings: {
            placeholder: "Short answer text",
          },
        },
      ],
    };
  }

  return {
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status,
    themeKey: form.themeKey || definition.themeKey || "soft-lavender",
    draftRevision: form.draftRevision,
    definition,
    updatedAt: form.updatedAt.toISOString(),
  };
}
