import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { z } from "zod";
import { ledgerEntrySchema } from "../value_object/ledger_entry";

export const ledgerSchema = baseEntitySchema.extend({
  entries: z.array(ledgerEntrySchema),
});

type LedgerData = z.infer<typeof ledgerSchema>;

/**
 * @kind Entity, Aggregate Root
 */
export class Ledger {
  readonly #data: LedgerData;

  private constructor(data: LedgerData) {
    this.#data = ledgerSchema.parse(data);
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(data: WithoutBaseEntity<LedgerData>): Ledger {
    return new Ledger({
      ...data,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(data: LedgerData): Ledger {
    return new Ledger(data);
  }

  get id() {
    return this.#data.id;
  }

  get entries() {
    return this.#data.entries;
  }
}
