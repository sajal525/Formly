const { PrismaClient } = require("@prisma/client");
const http = require("http");

const prisma = new PrismaClient();

async function measureQuery(name, fn) {
  const start = performance.now();
  const res = await fn();
  const duration = performance.now() - start;
  console.log(`[DB] ${name}: ${duration.toFixed(1)}ms`);
  return { duration, res };
}

async function measureHttp(name, path, options = {}) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const duration = performance.now() - start;
          console.log(`[HTTP] ${name} (${res.statusCode}): ${duration.toFixed(1)}ms (size: ${body.length}b)`);
          resolve({ status: res.statusCode, duration, bodyLength: body.length });
        });
      }
    );
    req.on("error", (err) => {
      console.log(`[HTTP ERROR] ${name}: ${err.message}`);
      resolve({ status: 500, duration: 0, error: err.message });
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log("=== Formly Performance Baseline Measurements ===\n");

  // 1. Raw DB Connection Acquisition & Ping
  console.log("--- 1. Database Connection & Basic Queries ---");
  await measureQuery("prisma.$queryRaw`SELECT 1` (warmup)", () => prisma.$queryRaw`SELECT 1 as ping`);
  await measureQuery("prisma.$queryRaw`SELECT 1` (warmed)", () => prisma.$queryRaw`SELECT 1 as ping`);
  await measureQuery("prisma.form.count()", () => prisma.form.count());
  await measureQuery("prisma.user.count()", () => prisma.user.count());
  await measureQuery("prisma.session.findFirst()", () => prisma.session.findFirst());
  await measureQuery("prisma.template.findMany()", () => prisma.template.findMany({ take: 10 }));

  // 2. HTTP Route Latency (unauthenticated paths)
  console.log("\n--- 2. Public HTTP Routes Latency ---");
  await measureHttp("GET /login", "/login");
  await measureHttp("GET /register", "/register");
  await measureHttp("GET /templates", "/templates");
  await measureHttp("GET /api/v1/search?q=form", "/api/v1/search?q=form");

  await prisma.$disconnect();
}

run();
