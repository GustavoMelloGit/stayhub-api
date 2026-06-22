import { z } from "zod";
import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { ValidationError } from "../../../core/application/error/validation_error";

/**
 * Security invariant: AppSetting must NOT store secrets, credentials, or PII.
 * This entity is intended for application configuration (feature flags, UI settings, etc.)
 * only. Sensitive values must be managed via environment variables or a secrets manager.
 */

// ---------------------------------------------------------------------------
// boundedJsonValue — reusable refinement for the `value` field
// Rejects: JSON > 16 KB, depth > 5, objects with > 50 root keys.
// ---------------------------------------------------------------------------

function measureDepth(val: unknown, current = 0): number {
  if (current > 5) return current;
  if (Array.isArray(val))
    return Math.max(...val.map(item => measureDepth(item, current + 1)));
  if (val !== null && typeof val === "object") {
    const values = Object.values(val as object);
    if (values.length === 0) return current;
    return Math.max(...values.map(v => measureDepth(v, current + 1)));
  }
  return current;
}

export const boundedJsonValue = z.unknown().superRefine((val, ctx) => {
  if (val === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Value is required",
    });
    return;
  }
  const json = JSON.stringify(val);
  if (json.length > 16384) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Value exceeds maximum allowed size of 16 KB",
    });
    return;
  }
  if (measureDepth(val) > 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Value exceeds maximum nesting depth of 5",
    });
    return;
  }
  if (
    val !== null &&
    typeof val === "object" &&
    !Array.isArray(val) &&
    Object.keys(val as object).length > 50
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Object value must not have more than 50 root keys",
    });
  }
});

export const appSettingTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "json",
]);

export type AppSettingType = z.infer<typeof appSettingTypeSchema>;

export const appSettingSchema = baseEntitySchema
  .extend({
    key: z
      .string()
      .min(1)
      .max(255)
      .regex(
        /^[a-z0-9_.-]+$/,
        "Key must contain only lowercase letters, digits, underscores, dots and hyphens"
      ),
    value: boundedJsonValue,
    type: appSettingTypeSchema,
    description: z.string().max(500).nullable().optional().default(null),
  })
  .superRefine((data, ctx) => {
    const { type, value } = data;
    if (type === "string" && typeof value !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid value for type string",
        path: ["value"],
      });
    } else if (type === "number") {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid value for type number",
          path: ["value"],
        });
      }
    } else if (type === "boolean" && typeof value !== "boolean") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid value for type boolean",
        path: ["value"],
      });
    } else if (type === "json") {
      if (value === null || typeof value !== "object") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid value for type json",
          path: ["value"],
        });
      }
    }
  });

export type AppSettingData = z.infer<typeof appSettingSchema>;

/**
 * @kind Entity, Aggregate Root
 * @bc settings
 *
 * Security note: do NOT store secrets, credentials, or PII in this entity.
 */
export class AppSetting {
  readonly #data: AppSettingData;

  private constructor(data: AppSettingData) {
    const result = appSettingSchema.safeParse(data);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid app setting";
      throw new ValidationError(message);
    }
    this.#data = result.data;
  }

  static #nextId(): string {
    return crypto.randomUUID();
  }

  static #baseEntityData() {
    return {
      id: this.#nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  public static reconstitute(data: AppSettingData): AppSetting {
    return new AppSetting(data);
  }

  public static create(data: WithoutBaseEntity<AppSettingData>): AppSetting {
    const normalizedKey = data.key.trim();
    return new AppSetting({
      ...data,
      key: normalizedKey,
      ...this.#baseEntityData(),
    });
  }

  /**
   * Returns a new AppSetting with the applied patch.
   * `key` is immutable and cannot be changed.
   */
  public update(patch: {
    value?: unknown;
    type?: AppSettingType;
    description?: string | null;
  }): AppSetting {
    return new AppSetting({
      ...this.#data,
      value: patch.value !== undefined ? patch.value : this.#data.value,
      type: patch.type !== undefined ? patch.type : this.#data.type,
      description:
        patch.description !== undefined
          ? patch.description
          : this.#data.description,
      updated_at: new Date(),
    });
  }

  /**
   * Returns a new AppSetting marked as deleted (soft delete).
   */
  public softDelete(): AppSetting {
    return new AppSetting({
      ...this.#data,
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }

  get id() {
    return this.#data.id;
  }

  get key() {
    return this.#data.key;
  }

  get value() {
    return this.#data.value;
  }

  get type() {
    return this.#data.type;
  }

  get description() {
    return this.#data.description ?? null;
  }

  get created_at() {
    return this.#data.created_at;
  }

  get updated_at() {
    return this.#data.updated_at;
  }

  get deleted_at() {
    return this.#data.deleted_at ?? null;
  }
}
