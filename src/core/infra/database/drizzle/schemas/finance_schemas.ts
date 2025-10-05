import { pgTable, varchar, integer, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { baseSchema } from "./base_schema";
import { propertiesTable } from "./property_schemas";

export const ledgerEntriesTable = pgTable("ledger_entries", {
  ...baseSchema,
  amount: integer().notNull(),
  description: varchar({ length: 500 }),
  category: varchar({ length: 100 }).notNull(),
  property_id: uuid()
    .references(() => propertiesTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const ledgerEntriesRelations = relations(
  ledgerEntriesTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [ledgerEntriesTable.property_id],
      references: [propertiesTable.id],
    }),
  }),
);
