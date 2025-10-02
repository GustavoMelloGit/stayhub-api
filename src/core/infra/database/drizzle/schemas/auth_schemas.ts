import { pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./base_schema";
import { propertiesTable } from "./property_schemas";

export const usersTable = pgTable("users", {
  ...baseSchema,
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  properties: many(propertiesTable),
}));
