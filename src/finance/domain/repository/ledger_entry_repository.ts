import type { LedgerEntry } from "../entity/ledger_entry";

export interface LedgerEntryRepository {
  save(entry: LedgerEntry): Promise<void>;
  allFromProperty(propertyId: string): Promise<LedgerEntry[]>;
  propertyBalance(propertyId: string): Promise<number>;
}
