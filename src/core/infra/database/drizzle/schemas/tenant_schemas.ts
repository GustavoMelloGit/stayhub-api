import { baseSchema } from "./base_schema";
import { relations } from "drizzle-orm";
import {
    pgTable,
    pgEnum,
    varchar
} from "drizzle-orm/pg-core";
import { staysTable } from "./stay_schemas";

export const sexEnum = pgEnum("sex", ["MALE", "FEMALE", "OTHER"]);

export const tenantsTable = pgTable("tenants", {
  ...baseSchema,
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 15 }).notNull().unique(),
  sex: sexEnum("sex").notNull(),
});

export const tenantsRelations = relations(tenantsTable, ({ many }) => ({
  stays: many(staysTable),
}));