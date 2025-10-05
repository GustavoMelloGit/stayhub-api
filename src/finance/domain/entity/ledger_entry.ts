import { z } from "zod";
import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";

export const ledgerEntrySchema = baseEntitySchema.extend({
  amount: z.int(),
  description: z.string().nullable(),
  category: z.string(),
  property_id: z.uuidv4(),
});

type LedgerEntryData = z.infer<typeof ledgerEntrySchema>;

/**
 * @kind Entity, Aggregate Root
 */
export class LedgerEntry {
  readonly #data: LedgerEntryData;

  private constructor(data: LedgerEntryData) {
    this.#data = ledgerEntrySchema.parse(data);
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(data: WithoutBaseEntity<LedgerEntryData>): LedgerEntry {
    return new LedgerEntry({
      ...data,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(data: LedgerEntryData): LedgerEntry {
    return new LedgerEntry(data);
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
