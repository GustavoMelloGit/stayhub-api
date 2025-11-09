import { baseSchema } from "./base_schema";
import { relations } from "drizzle-orm";
import { propertiesTable } from "./property_schemas";
import {
  pgTable, varchar,
  uuid,
  timestamp,
  integer
} from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenant_schemas";



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
