import { z } from "zod";
import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { ValidationError } from "../../../core/application/error/validation_error";

export const ledgerEntrySchema = baseEntitySchema.extend({
  amount: z.int(),
  description: z.string().nullable(),
  category: z.string(),
  property_id: z.uuidv4(),
  stay_id: z.uuidv4().nullable(),
});

export type LedgerEntryData = z.infer<typeof ledgerEntrySchema>;

/**
 * @kind Entity, Aggregate Root
 */
export class LedgerEntry {
  readonly #data: LedgerEntryData;

  private constructor(data: LedgerEntryData) {
    this.#data = ledgerEntrySchema.parse(data);
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

  public static reconstitute(data: LedgerEntryData): LedgerEntry {
    return new LedgerEntry(data);
  }

  public static newExpense(
    data: WithoutBaseEntity<LedgerEntryData>
  ): LedgerEntry {
    if (data.amount >= 0) {
      throw new ValidationError("Amount must be less than 0");
    }

    return new LedgerEntry({
      ...data,
      ...this.#baseEntityData(),
    });
  }

  public static newRevenue(
    data: WithoutBaseEntity<LedgerEntryData>
  ): LedgerEntry {
    if (data.amount <= 0) {
      throw new ValidationError("Amount must be greater than 0");
    }

    return new LedgerEntry({
      ...data,
      ...this.#baseEntityData(),
    });
  }

  get id() {
    return this.#data.id;
  }

  get amount() {
    return this.#data.amount;
  }

  get description() {
    return this.#data.description;
  }

  get category() {
    return this.#data.category;
  }

  get property_id() {
    return this.#data.property_id;
  }

  get stay_id() {
    return this.#data.stay_id;
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
