import { sql } from "drizzle-orm";
import { db } from "../../src/core/infra/database/drizzle/database";
import { env } from "../../src/core/infra/config/environments";

export async function truncate(tables: string[]): Promise<void> {
  if (env.NODE_ENV !== "test" || env.DB_SCHEMA !== "test") {
    throw new Error(
      "truncate() can only run when NODE_ENV=test and DB_SCHEMA=test"
    );
  }

  const tableRefs = tables.map(t => sql.identifier(t));
  const tableList = sql.join(tableRefs, sql.raw(", "));
  await db.execute(sql`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`);
}
