import { sql } from "drizzle-orm";
import { env } from "./infra/config/environments";
import { db } from "./infra/database/drizzle/database";
import { bunRoutes } from "./infra/http/routes/routes";

async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log(
      "✅ Connection to the database has been successfully verified.",
    );
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
}

async function main() {
  await checkDatabaseConnection();

  const server = Bun.serve({
    port: env.PORT,
    routes: bunRoutes,
  });

  console.log(`🚀 Listening on http://localhost:${server.port} ...`);
}

main();
