import { prisma } from "../src/lib/db";

export async function seed() {
  console.log("Database seeded successfully.");
}

if (process.env.NODE_ENV !== "test") {
  seed()
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
