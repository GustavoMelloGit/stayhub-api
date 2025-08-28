import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3030),
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "sandbox", "production"])
    .default("development"),
  JWT_SECRET: z.string(),
  REDIS_USERNAME: z.string().default("default"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);
