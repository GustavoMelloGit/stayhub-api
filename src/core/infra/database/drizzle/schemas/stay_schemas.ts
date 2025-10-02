import { baseSchema } from "./base_schema";
import { relations } from "drizzle-orm";
import { propertiesTable } from "./property_schemas";
import {
  pgTable,
  pgEnum,
  varchar,
  uuid,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

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

export const staysTable = pgTable("stays", {
  ...baseSchema,
  tenant_id: uuid()
    .references(() => tenantsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  property_id: uuid()
    .references(() => propertiesTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  check_in: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  check_out: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  guests: integer().notNull(),
  entrance_code: varchar({ length: 255 }).notNull(),
  price: integer().notNull(),
});

export const staysRelations = relations(staysTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [staysTable.tenant_id],
    references: [tenantsTable.id],
  }),
  property: one(propertiesTable, {
    fields: [staysTable.property_id],
    references: [propertiesTable.id],
  }),
}));
