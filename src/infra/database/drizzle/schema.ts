import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const tenantsTable = pgTable("tenants", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 15 }).notNull().unique(),
});

export const tenantsRelations = relations(tenantsTable, ({ many }) => ({
  stays: many(staysTable),
}));

export const staysTable = pgTable("stays", {
  id: uuid().primaryKey().defaultRandom(),
  tenant_id: uuid()
    .references(() => tenantsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  check_in: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  check_out: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  guests: integer().notNull(),
  password: varchar({ length: 255 }).notNull(),
});

export const staysRelations = relations(staysTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [staysTable.tenant_id],
    references: [tenantsTable.id],
  }),
}));

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});
