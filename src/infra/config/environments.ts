import { z } from "zod";

const envSchema = z.object({
  API_KEY: z.string(),
  AUTH_DOMAIN: z.string(),
  PROJECT_ID: z.string(),
  STORAGE_BUCKET: z.string(),
  MESSAGING_SENDER_ID: z.string(),
  APP_ID: z.string(),
  PORT: z.coerce.number().default(3030),
  DATABASE_URL: z.string()
});

export const env = envSchema.parse(process.env);
