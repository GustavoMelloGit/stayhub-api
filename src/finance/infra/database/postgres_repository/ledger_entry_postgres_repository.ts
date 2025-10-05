import { eq, sum } from "drizzle-orm";
import {
  LedgerEntry,
  type LedgerEntryData,
} from "../../../domain/entity/ledger_entry";
import type { LedgerEntryRepository } from "../../../domain/repository/ledger_entry_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import { ledgerEntriesTable } from "../../../../core/infra/database/drizzle/schema";

export class LedgerEntryPostgresRepository implements LedgerEntryRepository {
  async save(entry: LedgerEntry): Promise<void> {
    const data: LedgerEntryData = {
      id: entry.id,
      amount: entry.amount,
      category: entry.category,
      property_id: entry.property_id,
      description: entry.description,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      deleted_at: entry.deleted_at,
    };

    const result = await db.insert(ledgerEntriesTable).values(data).returning();

    if (!result[0]) {
      throw new Error("Failed to save ledger entry");
    }
  }

  async allFromProperty(propertyId: string): Promise<LedgerEntry[]> {
    const entries = await db.query.ledgerEntriesTable.findMany({
      where: eq(ledgerEntriesTable.property_id, propertyId),
    });

    return entries.map(entry => LedgerEntry.reconstitute(entry));
  }

  async propertyBalance(propertyId: string): Promise<number> {
    const result = await db
      .select({ total: sum(ledgerEntriesTable.amount) })
      .from(ledgerEntriesTable)
      .where(eq(ledgerEntriesTable.property_id, propertyId));

    const total = result[0]?.total;
    return total ? Number(total) : 0;
  }
}
