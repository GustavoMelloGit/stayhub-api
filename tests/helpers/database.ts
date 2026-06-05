import { sql } from "drizzle-orm";
import { db } from "../../src/core/infra/database/drizzle/database";
import { env } from "../../src/core/infra/config/environments";

export async function truncate(tables: string[]): Promise<void> {
  if (env.NODE_ENV !== "test") {
    throw new Error("truncate() can only run in test environment");
  }

  const tableList = tables.join(", ");
  await db.execute(sql.raw(`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`));
}
