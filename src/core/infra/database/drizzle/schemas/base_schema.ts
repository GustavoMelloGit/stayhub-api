import { timestamp, uuid } from "drizzle-orm/pg-core";

export const baseSchema = {
  id: uuid().primaryKey().defaultRandom(),
  created_at: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deleted_at: timestamp({ withTimezone: true, mode: "date" }),
};
