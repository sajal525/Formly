import "server-only";
import { prisma } from "@/lib/db";
import { CreateFormInput } from "../schemas/create-form-schema";

export interface CreatedFormDTO {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
}

import {
  BuilderFormDefinition,
  BuilderQuestion,
  BuilderQuestionType,
  formSettingsSchema,
} from "@/features/builder/schemas/builder-definition-schema";

export async function createBlankForm(
  userId: string,
  input?: CreateFormInput
): Promise<CreatedFormDTO> {
  // Read creator's default preferences with minimal projection
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { defaultThemeId: true, defaultQuestionType: true },
  });

  const defaultTheme = userSettings?.defaultThemeId || "soft-lavender";
  const defaultQuestionType = (userSettings?.defaultQuestionType || "SHORT_TEXT") as BuilderQuestionType;

  const initialQuestion: BuilderQuestion = {
    id: `q-${Date.now()}`,
    type: defaultQuestionType,
    label: "Untitled question",
    description: null,
    required: false,
    settings: {
      placeholder: defaultQuestionType === "SHORT_TEXT" ? "Short answer text" : undefined,
    },
    options: ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(defaultQuestionType)
      ? [
          { id: `opt-${Date.now()}-1`, label: "Option 1", value: "option_1" },
          { id: `opt-${Date.now()}-2`, label: "Option 2", value: "option_2" },
        ]
      : undefined,
  };

  const initialDefinition: BuilderFormDefinition = {
    schemaVersion: 1,
    title: input?.title || "Untitled form",
    description: input?.description || null,
    themeKey: defaultTheme,
    settings: formSettingsSchema.parse({}),
    questions: [initialQuestion],
  };

  const form = await prisma.form.create({
    data: {
      ownerId: userId,
      title: input?.title || "Untitled form",
      description: input?.description || null,
      status: "DRAFT",
      themeKey: defaultTheme,
      definition: initialDefinition as any,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
  });

  return form;
}
