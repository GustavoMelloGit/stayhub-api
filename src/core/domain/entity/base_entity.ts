import { z } from "zod";

export const baseEntitySchema = z.object({
  id: z.uuidv4(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable().optional(),
});

export type BaseEntity = z.infer<typeof baseEntitySchema>;
export type WithoutBaseEntity<T> = Omit<T, keyof BaseEntity>;

export type SafeUpdateEntity<T extends BaseEntity> = Partial<
  Omit<T, "id" | "created_at" | "updated_at" | "deleted_at">
>;
