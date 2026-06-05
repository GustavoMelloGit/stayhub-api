import { $ } from "bun";
import { env } from "../src/core/infra/config/environments";

await $`psql ${env.DATABASE_URL} -c 'CREATE SCHEMA IF NOT EXISTS test'`;
await $`drizzle-kit push`;
