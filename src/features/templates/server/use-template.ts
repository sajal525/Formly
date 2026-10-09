import "server-only";
import { prisma } from "@/lib/db";
import { formDefinitionV1Schema } from "../data/definition-v1-schema";

export interface UsedTemplateResultDTO {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
}

export async function createDraftFromTemplate(
  userId: string,
  templateIdOrSlug: string
): Promise<UsedTemplateResultDTO> {
  // 1. Fetch published template and latest version
  const template = await prisma.template.findFirst({
    where: {
      OR: [{ id: templateIdOrSlug }, { slug: templateIdOrSlug }],
      isPublished: true,
    },
    include: {
      versions: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!template || template.versions.length === 0) {
    throw new Error("Template not found or no published version available");
  }

  const latestVersion = template.versions[0];

  // 2. Validate definition snapshot
  const parsed = formDefinitionV1Schema.safeParse(latestVersion.definition);
  if (!parsed.success) {
    throw new Error("Template definition failed validation");
  }

  // 3. Clone snapshot independently
  const clonedDefinition = JSON.parse(JSON.stringify(parsed.data));

  // 4. Create new owned Form in transaction
  const newForm = await prisma.$transaction(async (tx) => {
    return tx.form.create({
      data: {
        ownerId: userId,
        title: template.title,
        description: template.description,
        themeKey: template.themeKey,
        status: "DRAFT",
        definition: clonedDefinition,
        definitionVersion: latestVersion.definitionVersion,
        sourceTemplateId: template.id,
        sourceTemplateVersionId: latestVersion.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
  });

  return newForm;
}
