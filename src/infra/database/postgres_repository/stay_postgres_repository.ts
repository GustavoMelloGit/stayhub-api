import { and, eq, gte } from "drizzle-orm";
import { Stay } from "../../../domain/entity/stay";
import { Tenant, type WithTenant } from "../../../domain/entity/tenant";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import { db } from "../drizzle/database";
import { staysTable } from "../drizzle/schema";

export class StayPostgresRepository implements StayRepository {
  async stayOfId(id: string): Promise<WithTenant<Stay> | null> {
    const stay = await db.query.staysTable.findFirst({
      where: and(eq(staysTable.id, id)),
      with: {
        tenant: true,
      },
    });

    if (!stay) {
      return null;
    }

    const stayEntity = Stay.reconstitute(stay);

    return {
      ...stayEntity,
      data: stayEntity.data,
      tenant: Tenant.reconstitute(stay.tenant),
    };
  }

  async saveStay(input: Stay): Promise<void> {
    const result = await db.insert(staysTable).values(input.data).returning();

    if (!result[0]) throw new Error("Failed to save stay");
  }

  async allFutureFromProperty(propertyId: string): Promise<WithTenant<Stay>[]> {
    const stays = await db.query.staysTable.findMany({
      where: and(
        eq(staysTable.property_id, propertyId),
        gte(staysTable.check_in, new Date()),
      ),
      with: {
        tenant: true,
      },
      orderBy: (staysTable, { asc }) => [asc(staysTable.check_in)],
    });

    return stays.map((stay) => ({
      ...Stay.reconstitute(stay),
      data: stay,
      tenant: Tenant.reconstitute(stay.tenant),
    }));
  }

  async allFromProperty(propertyId: string): Promise<WithTenant<Stay>[]> {
    const stays = await db.query.staysTable.findMany({
      where: eq(staysTable.property_id, propertyId),
      with: {
        tenant: true,
      },
      orderBy: (staysTable, { asc }) => [asc(staysTable.check_in)],
    });

    return stays.map((stay) => ({
      ...Stay.reconstitute(stay),
      data: stay,
      tenant: Tenant.reconstitute(stay.tenant),
    }));
  }
}
