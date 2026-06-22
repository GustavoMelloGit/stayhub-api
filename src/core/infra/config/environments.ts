import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().trim(),
  NODE_ENV: z
    .enum(["development", "test", "sandbox", "production"])
    .default("development"),
  JWT_SECRET: z.string().trim(),
  TUYA_DEVICE_ID: z.string().trim(),
  TUYA_CLIENT_ID: z.string().trim(),
  TUYA_CLIENT_SECRET: z.string().trim(),
  API_BASE_URL: z.string().trim().optional(),
});

export const env = envSchema.parse(process.env);
