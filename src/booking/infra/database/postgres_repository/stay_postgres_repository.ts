import { and, count, eq, gte, isNull } from "drizzle-orm";
import { Stay } from "../../../domain/entity/stay";
import type {
  AllFromPropertyFilters,
  StayRepository,
  StayWithTenant,
} from "../../../domain/repository/stay_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import {
  staysTable,
  tenantsTable,
} from "../../../../core/infra/database/drizzle/schema";
import { Tenant } from "../../../domain/entity/tenant";
import {
  calculatePaginationMetadata,
  type PaginatedResult,
  type PaginationInput,
} from "../../../../core/application/dto/pagination";

export class StayPostgresRepository implements StayRepository {
  async stayOfId(id: string): Promise<Stay | null> {
    const stay = await db.query.staysTable.findFirst({
      where: and(eq(staysTable.id, id), isNull(staysTable.deleted_at)),
      with: {
        tenant: true,
      },
    });

    if (!stay) {
      return null;
    }

    return Stay.reconstitute(stay);
  }

  async saveStay(input: Stay): Promise<void> {
    const stayAlreadyExists = await this.stayOfId(input.id);
    if (stayAlreadyExists) {
      await this.#updateStay(input);
    } else {
      await this.#createStay(input);
    }
  }

  async #createStay(stay: Stay): Promise<Stay> {
    const result = await db.insert(staysTable).values(stay.data).returning();

    if (!result[0]) throw new Error("Failed to create stay");

    return Stay.reconstitute(result[0]);
  }

  async #updateStay(stay: Stay): Promise<Stay> {
    const result = await db
      .update(staysTable)
      .set(stay.data)
      .where(eq(staysTable.id, stay.id))
      .returning();

    if (!result[0]) throw new Error("Failed to update stay");

    return Stay.reconstitute(result[0]);
  }

  async allFutureFromProperty(propertyId: string): Promise<StayWithTenant[]> {
    const stays = await db.query.staysTable.findMany({
      where: and(
        eq(staysTable.property_id, propertyId),
        gte(staysTable.check_out, new Date()),
        isNull(staysTable.deleted_at)
      ),
      with: {
        tenant: true,
      },
      orderBy: (staysTable, { asc }) => [asc(staysTable.check_in)],
    });

    return stays.map(stay => ({
      stay: Stay.reconstitute(stay),
      tenant: Tenant.reconstitute(stay.tenant),
    }));
  }

  async allFromProperty(
    propertyId: string,
    pagination: PaginationInput,
    filters?: AllFromPropertyFilters
  ): Promise<PaginatedResult<StayWithTenant>> {
    const whereClause = and(
      eq(staysTable.property_id, propertyId),
      isNull(staysTable.deleted_at),
      filters?.onlyIncomingStays
        ? gte(staysTable.check_in, new Date())
        : undefined
    );

    const [totalResult, stays] = await Promise.all([
      db.select({ count: count() }).from(staysTable).where(whereClause),
      db.query.staysTable.findMany({
        where: whereClause,
        with: {
          tenant: true,
        },
        orderBy: (staysTable, { asc }) => [asc(staysTable.check_in)],
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
      }),
    ]);

    const total = totalResult[0]?.count ? Number(totalResult[0].count) : 0;

    return {
      data: stays.map(stay => ({
        stay: Stay.reconstitute(stay),
        tenant: Tenant.reconstitute(stay.tenant),
      })),
      pagination: calculatePaginationMetadata(
        pagination.page,
        pagination.limit,
        total
      ),
    };
  }

  async tenantWithPhone(phone: string): Promise<Tenant | null> {
    const tenant = await db.query.tenantsTable.findFirst({
      where: eq(tenantsTable.phone, phone),
    });

    if (!tenant) {
      return null;
    }

    return Tenant.reconstitute(tenant);
  }
}
