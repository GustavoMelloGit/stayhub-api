import { sql } from "drizzle-orm";
import { db } from "./core/infra/database/drizzle/database";
import { env } from "./core/infra/config/environments";
import { bunRoutes } from "./core/infra/http/routes/routes";
import { CoreDi } from "./core/infra/di/core_di";
import type { Logger } from "./core/application/logger/logger";

async function checkDatabaseConnection(logger: Logger) {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info(
      "✅ Connection to the database has been successfully verified."
    );
  } catch (error) {
    logger.error("❌ Unable to connect to the database", { error });
    process.exit(1);
  }
}

async function main() {
  const coreDi = new CoreDi();
  const logger = coreDi.makeLogger();

  await checkDatabaseConnection(logger);

  const server = Bun.serve({
    port: env.PORT,
    routes: bunRoutes,
    hostname: "0.0.0.0",
  });

  const isProduction = env.NODE_ENV === "production";
  logger.info(
    isProduction
      ? `🚀 API running in production mode`
      : `🚀 Listening on http://localhost:${server.port}`,
    { port: server.port, environment: env.NODE_ENV }
  );
}

main();
