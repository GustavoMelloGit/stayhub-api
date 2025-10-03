import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { z } from "zod";

export type Sex = "MALE" | "FEMALE" | "OTHER";

export const tenantSchema = baseEntitySchema.extend({
  name: z.string().min(3),
  phone: z
    .string()
    .regex(/^[0-9]+$/, "Phone must contain only numbers")
    .min(10)
    .max(15),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
});

type TenantData = z.infer<typeof tenantSchema>;

export type WithTenant<T> = T & {
  tenant: Tenant;
};

/**
 * @kind Entity, Aggregate Root
 */
export class Tenant {
  private readonly data: TenantData;

  private constructor(data: TenantData) {
    this.data = tenantSchema.parse(data);
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(data: WithoutBaseEntity<TenantData>): Tenant {
    return new Tenant({
      ...data,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(data: TenantData): Tenant {
    return new Tenant(data);
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get phone() {
    return this.data.phone;
  }

  get sex() {
    return this.data.sex;
  }

  get created_at() {
    return this.data.created_at;
  }

  get updated_at() {
    return this.data.updated_at;
  }

  get deleted_at() {
    return this.data.deleted_at;
  }
}
