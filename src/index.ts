import { sql } from "drizzle-orm";
import { db } from "./core/infra/database/drizzle/database";
import { env } from "./core/infra/config/environments";
import { bunRoutes } from "./core/infra/http/routes/routes";

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
    hostname: "0.0.0.0",
  });

  const isProduction = env.NODE_ENV === "production";
  console.log(
    isProduction
      ? `🚀 API running in production mode`
      : `🚀 Listening on http://localhost:${server.port}`,
  );
}

main();
