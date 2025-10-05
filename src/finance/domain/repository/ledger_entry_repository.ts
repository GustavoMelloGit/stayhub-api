import type { LedgerEntry } from "../entity/ledger_entry";
import type {
  PaginatedResult,
  PaginationInput,
} from "../../../core/application/dto/pagination";

export interface LedgerEntryRepository {
  save(entry: LedgerEntry): Promise<void>;
  propertyBalance(propertyId: string): Promise<number>;
  findByPropertyId(
    propertyId: string,
    pagination: PaginationInput
  ): Promise<PaginatedResult<LedgerEntry>>;
}
