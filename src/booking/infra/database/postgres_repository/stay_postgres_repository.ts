import { and, eq, gte } from "drizzle-orm";
import { Stay } from "../../../domain/entity/stay";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import {
  staysTable,
  tenantsTable,
} from "../../../../core/infra/database/drizzle/schema";
import { Tenant } from "../../../domain/entity/tenant";

export class StayPostgresRepository implements StayRepository {
  async stayOfId(id: string): Promise<Stay | null> {
    const stay = await db.query.staysTable.findFirst({
      where: and(eq(staysTable.id, id)),
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
    const result = await db.insert(staysTable).values(input).returning();

    if (!result[0]) throw new Error("Failed to save stay");
  }

  async allFutureFromProperty(propertyId: string): Promise<Stay[]> {
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

    return stays.map((stay) => Stay.reconstitute(stay));
  }

  async allFromProperty(propertyId: string): Promise<Stay[]> {
    const stays = await db.query.staysTable.findMany({
      where: eq(staysTable.property_id, propertyId),
      with: {
        tenant: true,
      },
      orderBy: (staysTable, { asc }) => [asc(staysTable.check_in)],
    });

    return stays.map((stay) => Stay.reconstitute(stay));
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
