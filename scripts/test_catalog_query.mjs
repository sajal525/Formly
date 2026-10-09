import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testQuery() {
  const where = {
    isPublished: true,
    categoryKey: "education",
  };
  const results = await prisma.template.findMany({ where });
  console.log("Found templates with categoryKey='education':", results.map(r => ({ slug: r.slug, title: r.title, categoryKey: r.categoryKey })));

  const searchWhere = {
    isPublished: true,
    OR: [
      { title: { contains: "feedback", mode: "insensitive" } },
      { description: { contains: "feedback", mode: "insensitive" } }
    ]
  };
  const searchResults = await prisma.template.findMany({ where: searchWhere });
  console.log("Found templates with search 'feedback':", searchResults.map(r => ({ slug: r.slug, title: r.title })));
}

testQuery().finally(() => prisma.$disconnect());
