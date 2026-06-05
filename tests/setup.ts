import { afterAll } from "bun:test";
import { bunRoutes } from "../src/core/infra/http/routes/routes";

const server = Bun.serve({
  port: 0,
  routes: bunRoutes,
});

export const baseUrl = `http://localhost:${server.port}`;

afterAll(() => {
  server.stop();
});
