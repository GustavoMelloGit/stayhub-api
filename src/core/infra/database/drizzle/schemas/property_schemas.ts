import { pgEnum, pgTable, varchar, uuid } from "drizzle-orm/pg-core";
import { baseSchema } from "./base_schema";
import { relations } from "drizzle-orm";
import { usersTable } from "./auth_schemas";
import { staysTable } from "./stay_schemas";

export const propertiesTable = pgTable("properties", {
  ...baseSchema,
  name: varchar({ length: 255 }).notNull(),
  user_id: uuid()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const propertiesRelations = relations(
  propertiesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [propertiesTable.user_id],
      references: [usersTable.id],
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
