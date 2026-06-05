import { $ } from "bun";
import { env } from "../src/core/infra/config/environments";

await $`psql ${env.DATABASE_URL} -c 'DROP SCHEMA IF EXISTS test CASCADE; CREATE SCHEMA test'`;
await $`drizzle-kit push`;
