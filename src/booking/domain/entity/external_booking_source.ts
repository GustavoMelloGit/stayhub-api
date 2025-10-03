import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { z } from "zod";

export type ExternalBookingSourcePlatformName = "AIRBNB" | "BOOKING";

export const externalBookingSourceSchema = baseEntitySchema.extend({
  property_id: z.string().uuid(),
  platform_name: z.enum(["AIRBNB", "BOOKING"]),
  sync_url: z.string().url(),
});

type ExternalBookingSourceData = z.infer<typeof externalBookingSourceSchema>;

export class ExternalBookingSource {
  private readonly data: ExternalBookingSourceData;

  private constructor(data: ExternalBookingSourceData) {
    this.data = externalBookingSourceSchema.parse(data);
  }

  static #nextId(): string {
    return crypto.randomUUID();
  }

  public static create(
    data: WithoutBaseEntity<ExternalBookingSourceData>,
  ): ExternalBookingSource {
    return new ExternalBookingSource({
      ...data,
      id: this.#nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(
    data: ExternalBookingSourceData,
  ): ExternalBookingSource {
    return new ExternalBookingSource(data);
  }

  get id() {
    return this.data.id;
  }

  get property_id() {
    return this.data.property_id;
  }

  get platform_name() {
    return this.data.platform_name;
  }

  get sync_url() {
    return this.data.sync_url;
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
