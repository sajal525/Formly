const { PrismaClient } = require("@prisma/client");

async function run() {
  const url =
    "postgresql://neondb_owner:npg_EOrLAlQhR28B@ep-tiny-bird-b1ghwxs1-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15&connection_limit=15";
  const p = new PrismaClient({ datasources: { db: { url } } });

  console.log("Warmup...");
  await p.user.findFirst();

  console.log("Testing 10 SIMULTANEOUS queries with optimized URL...");
  const t0 = Date.now();
  const promises = Array.from({ length: 10 }).map(async (_, i) => {
    const start = Date.now();
    await p.form.count();
    return Date.now() - start;
  });

  const durations = await Promise.all(promises);
  console.log("Durations for each of the 10 concurrent queries:", durations);
  console.log("Total elapsed for 10 concurrent queries:", Date.now() - t0, "ms");

  await p.$disconnect();
}

run().catch(console.error);
