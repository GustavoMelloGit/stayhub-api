import { pgEnum, pgTable, varchar, uuid, integer, text } from "drizzle-orm/pg-core";
import { baseSchema } from "./base_schema";
import { relations } from "drizzle-orm";
import { usersTable } from "./auth_schemas";
import { staysTable } from "./stay_schemas";

export const addressesTable = pgTable("addresses", {
  ...baseSchema,
  street: varchar({ length: 255 }).notNull(),
  number: varchar({ length: 50 }).notNull(),
  neighborhood: varchar({ length: 255 }).notNull(),
  city: varchar({ length: 255 }).notNull(),
  state: varchar({ length: 255 }).notNull(),
  zip_code: varchar({ length: 20 }).notNull(),
  country: varchar({ length: 255 }).notNull(),
  complement: varchar({ length: 255 }).notNull().default(""),
});

export const addressesRelations = relations(
  addressesTable,
  ({ many }) => ({
    properties: many(propertiesTable),
  }),
);

export const propertiesTable = pgTable("properties", {
  ...baseSchema,
  name: varchar({ length: 255 }).notNull(),
  user_id: uuid()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  address_id: uuid()
    .references(() => addressesTable.id, {
      onDelete: "cascade",
    })
    .notNull().defaultRandom(),
  images: text().array().notNull().default([]),
  capacity: integer().notNull().default(1),
});

export const propertiesRelations = relations(
  propertiesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [propertiesTable.user_id],
      references: [usersTable.id],
    }),
    address: one(addressesTable, {
      fields: [propertiesTable.address_id],
      references: [addressesTable.id],
    }),
    stays: many(staysTable),
  }),
);

export const calendarSyncPlatformsEnum = pgEnum("calendar_sync_platforms", [
  "AIRBNB",
  "BOOKING",
]);

export const externalBookingSources = pgTable("external_booking_sources", {
  ...baseSchema,
  property_id: uuid()
    .references(() => propertiesTable.id)
    .notNull(),
  platform_name: calendarSyncPlatformsEnum().notNull(),
  sync_url: varchar({ length: 512 }).notNull(),
});

export const externalBookingSourcesRelations = relations(
  externalBookingSources,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [externalBookingSources.property_id],
      references: [propertiesTable.id],
    }),
  }),
);
