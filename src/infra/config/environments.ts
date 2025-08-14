import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3030),
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "sandbox", "production"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
