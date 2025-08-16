import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const baseSchema = {
  id: uuid().primaryKey().defaultRandom(),
  created_at: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deleted_at: timestamp({ withTimezone: true, mode: "date" }),
};

export const tenantsTable = pgTable("tenants", {
  ...baseSchema,
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 15 }).notNull().unique(),
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
  calendar_id: uuid()
    .references(() => calendarsTable.id, {
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
  calendar: one(calendarsTable, {
    fields: [staysTable.calendar_id],
    references: [calendarsTable.id],
  }),
}));

export const usersTable = pgTable("users", {
  ...baseSchema,
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  calendars: many(calendarsTable),
}));

export const calendarsTable = pgTable("calendars", {
  ...baseSchema,
  name: varchar({ length: 255 }).notNull(),
  user_id: uuid()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const calendarsRelations = relations(
  calendarsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [calendarsTable.user_id],
      references: [usersTable.id],
    }),
    stays: many(staysTable),
  }),
);
