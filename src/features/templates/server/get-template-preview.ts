import "server-only";
import { prisma } from "@/lib/db";
import {
  formDefinitionV1Schema,
  FormDefinitionV1,
} from "../data/definition-v1-schema";

export interface TemplatePreviewDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryKey: string;
  themeKey: string | null;
  versionId: string;
  version: number;
  definition: FormDefinitionV1;
}

export async function getTemplatePreview(
  templateIdOrSlug: string
): Promise<TemplatePreviewDTO | null> {
  const template = await prisma.template.findFirst({
    where: {
      OR: [{ id: templateIdOrSlug }, { slug: templateIdOrSlug }],
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      categoryKey: true,
      themeKey: true,
      versions: {
        orderBy: { version: "desc" },
        take: 1,
        select: {
          id: true,
          version: true,
          definition: true,
        },
      },
    },
  });

  if (!template || template.versions.length === 0) {
    return null;
  }

  const latestVersion = template.versions[0];
  const parsedDefinition = formDefinitionV1Schema.safeParse(
    latestVersion.definition
  );

  const fallbackDefinition: FormDefinitionV1 = {
    schemaVersion: 1,
    title: template.title,
    description: template.description,
    themeKey: template.themeKey || "default",
    questions: [],
  };

  return {
    id: template.id,
    slug: template.slug,
    title: template.title,
    description: template.description,
    categoryKey: template.categoryKey,
    themeKey: template.themeKey,
    versionId: latestVersion.id,
    version: latestVersion.version,
    definition: parsedDefinition.success
      ? parsedDefinition.data
      : fallbackDefinition,
  };
}
