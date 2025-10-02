import { defineConfig } from "drizzle-kit";
import { env } from "./src/core/infra/config/environments";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/core/infra/database/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
