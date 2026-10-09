import { prisma } from "../src/lib/db";
import { initialTemplates } from "../src/features/templates/data/initial-templates";

export async function seedTemplates() {
  console.log("Seeding Formly templates catalogue...");

  for (const item of initialTemplates) {
    const template = await prisma.template.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        categoryKey: item.categoryKey,
        themeKey: item.themeKey,
        featuredRank: item.featuredRank,
        isPublished: true,
      },
      create: {
        slug: item.slug,
        title: item.title,
        description: item.description,
        categoryKey: item.categoryKey,
        themeKey: item.themeKey,
        featuredRank: item.featuredRank,
        isPublished: true,
      },
    });

    const existingVersion = await prisma.templateVersion.findUnique({
      where: {
        templateId_version: {
          templateId: template.id,
          version: 1,
        },
      },
    });

    if (!existingVersion) {
      await prisma.templateVersion.create({
        data: {
          templateId: template.id,
          version: 1,
          definitionVersion: 1,
          definition: item.definition,
          publishedAt: new Date(),
        },
      });
      console.log(`+ Seeded template version 1 for "${item.title}"`);
    } else {
      await prisma.templateVersion.update({
        where: { id: existingVersion.id },
        data: {
          definition: item.definition,
          definitionVersion: 1,
        },
      });
      console.log(`✓ Updated template version 1 for "${item.title}"`);
    }
  }

  const totalTemplates = await prisma.template.count();
  console.log(`Catalogue has ${totalTemplates} published templates.`);
}

if (process.env.NODE_ENV !== "test") {
  seedTemplates()
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
