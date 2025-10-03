import { ValidationError } from "../../../core/application/error/validation_error";
import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { z } from "zod";

export const staySchema = baseEntitySchema.extend({
  check_in: z.date(),
  check_out: z.date(),
  tenant_id: z.uuidv4(),
  property_id: z.uuidv4(),
  guests: z.number().int().positive(),
  entrance_code: z.string().length(7),
  price: z.number().int().nonnegative(),
});

type StayData = z.infer<typeof staySchema>;

/**
 * @kind Entity
 */
export class Stay {
  readonly #data: StayData;

  private constructor(data: StayData) {
    this.#data = staySchema.parse(data);
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(data: WithoutBaseEntity<StayData>): Stay {
    if (data.check_in >= data.check_out) {
      throw new ValidationError("Check-in date must be before check-out date");
    }

    return new Stay({
      ...data,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(data: StayData): Stay {
    return new Stay(data);
  }

  get id() {
    return this.#data.id;
  }

  get check_in() {
    return this.#data.check_in;
  }

  get check_out() {
    return this.#data.check_out;
  }

  get tenant_id() {
    return this.#data.tenant_id;
  }

  get property_id() {
    return this.#data.property_id;
  }

  get guests() {
    return this.#data.guests;
  }

  get entrance_code() {
    return this.#data.entrance_code;
  }

  get price() {
    return this.#data.price;
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
