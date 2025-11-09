import { eq, sum, count, desc } from "drizzle-orm";
import {
  LedgerEntry,
  type LedgerEntryData,
} from "../../../domain/entity/ledger_entry";
import type { LedgerEntryRepository } from "../../../domain/repository/ledger_entry_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import { ledgerEntriesTable } from "../../../../core/infra/database/drizzle/schema";
import type {
  PaginatedResult,
  PaginationInput,
} from "../../../../core/application/dto/pagination";
import { calculatePaginationMetadata } from "../../../../core/application/dto/pagination";

export class LedgerEntryPostgresRepository implements LedgerEntryRepository {
  async save(entry: LedgerEntry): Promise<void> {
    const data: LedgerEntryData = {
      id: entry.id,
      amount: entry.amount,
      category: entry.category,
      property_id: entry.property_id,
      description: entry.description,
      stay_id: entry.stay_id,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      deleted_at: entry.deleted_at,
    };

    const result = await db.insert(ledgerEntriesTable).values(data).returning();

    if (!result[0]) {
      throw new Error("Failed to save ledger entry");
    }
  }

  async propertyBalance(propertyId: string): Promise<number> {
    const result = await db
      .select({ total: sum(ledgerEntriesTable.amount) })
      .from(ledgerEntriesTable)
      .where(eq(ledgerEntriesTable.property_id, propertyId));

    const total = result[0]?.total;
    return total ? Number(total) : 0;
  }

  async findByPropertyId(
    propertyId: string,
    pagination: PaginationInput
  ): Promise<PaginatedResult<LedgerEntry>> {
    const whereClause = eq(ledgerEntriesTable.property_id, propertyId);
    const offset = (pagination.page - 1) * pagination.limit;

    const [totalResult, entries] = await Promise.all([
      db.select({ count: count() }).from(ledgerEntriesTable).where(whereClause),
      db
        .select()
        .from(ledgerEntriesTable)
        .where(whereClause)
        .orderBy(desc(ledgerEntriesTable.created_at))
        .limit(pagination.limit)
        .offset(offset),
    ]);

    const total = totalResult[0]?.count ? Number(totalResult[0].count) : 0;

    const ledgerEntries = entries.map(entry => LedgerEntry.reconstitute(entry));

    return {
      data: ledgerEntries,
      pagination: calculatePaginationMetadata(
        pagination.page,
        pagination.limit,
        total
      ),
    };
  }
}
