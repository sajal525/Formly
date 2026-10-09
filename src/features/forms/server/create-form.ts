import "server-only";
import { prisma } from "@/lib/db";
import { CreateFormInput } from "../schemas/create-form-schema";

export interface CreatedFormDTO {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
}

export async function createBlankForm(
  userId: string,
  input?: CreateFormInput
): Promise<CreatedFormDTO> {
  // Read creator's default settings
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  const defaultTheme = userSettings?.defaultThemeId || "soft-lavender";
  const defaultQuestionType = userSettings?.defaultQuestionType || "SHORT_TEXT";

  const form = await prisma.form.create({
    data: {
      ownerId: userId,
      title: input?.title || "Untitled form",
      description: input?.description || null,
      status: "DRAFT",
      themeKey: defaultTheme,
      definition: {
        schemaVersion: 1,
        title: input?.title || "Untitled form",
        description: input?.description || null,
        themeKey: defaultTheme,
        questions: [
          {
            id: `q-${Date.now()}`,
            type: defaultQuestionType,
            label: "Untitled question",
            description: null,
            required: false,
            settings: {
              placeholder: "Short answer text",
            },
          },
        ],
      },
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
