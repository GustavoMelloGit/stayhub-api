import { jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import { baseSchema } from "./base_schema";

export const appSettingsTable = pgTable("app_settings", {
  ...baseSchema,
  key: varchar({ length: 255 }).notNull().unique(),
  value: jsonb().notNull(),
  type: varchar({ length: 20 }).notNull(),
  description: varchar({ length: 500 }),
});
