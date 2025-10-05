import type { BookingPolicy } from "../policy/booking_policy";
import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { z } from "zod";
import { Stay } from "./stay";

export const propertySchema = baseEntitySchema.extend({
  name: z.string().min(1),
  user_id: z.string().uuid(),
});

export type PropertyData = z.infer<typeof propertySchema>;

/**
 * @kind Entity, Aggregate Root
 */
export class Property {
  readonly #data: PropertyData;

  private constructor(data: PropertyData) {
    this.#data = propertySchema.parse(data);
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(data: WithoutBaseEntity<PropertyData>): Property {
    return new Property({
      ...data,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(data: PropertyData): Property {
    return new Property(data);
  }

  public async bookStay(
    args: BookStayArgs,
    bookingPolicy: BookingPolicy
  ): Promise<Stay> {
    const { check_in, check_out, guests } = args;

    await bookingPolicy.isBookingAllowed(this.id, check_in, check_out, guests);

    const stay = Stay.create({
      ...args,
      property_id: this.id,
    });

    return stay;
  }

  get id() {
    return this.#data.id;
  }

  get name() {
    return this.#data.name;
  }

  get user_id() {
    return this.#data.user_id;
  }

  get created_at() {
    return this.#data.created_at;
  }

  get updated_at() {
    return this.#data.updated_at;
  }

  get deleted_at() {
    return this.#data.deleted_at;
  }
}

type BookStayArgs = {
  check_in: Date;
  check_out: Date;
  tenant_id: string;
  guests: number;
  entrance_code: string;
  price: number;
};
