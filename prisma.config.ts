import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    // seed.ts now calls add-tormac.ts itself. Chaining with `&&` here does
    // not work — Prisma does not run this through a shell, so the second
    // command was silently skipped.
    seed: "tsx prisma/seed.ts",
  },
});
