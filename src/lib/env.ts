export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  DIRECT_URL: process.env.DIRECT_URL || "",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "default-dev-secret-do-not-use-in-production-123456789",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
};
