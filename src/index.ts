import { env } from "./infra/config/environments";
import { bunRoutes } from "./infra/http/routes/routes";

function main() {
  const server = Bun.serve({
    port: env.PORT,
    routes: bunRoutes,
  });

  console.log(`Listening on http://localhost:${server.port} ...`);
}

main();
