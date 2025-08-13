import { bunRoutes } from "./infra/http/routes/routes";

function main() {
  const server = Bun.serve({
    port: 3030,
    routes: bunRoutes,
  });

  console.log(`Listening on http://localhost:${server.port} ...`);
}

main();
