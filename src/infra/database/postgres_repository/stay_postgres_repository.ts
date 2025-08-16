import { eq } from "drizzle-orm";
import { Stay } from "../../../domain/entity/stay";
import { Tenant, type WithTenant } from "../../../domain/entity/tenant";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import { db } from "../drizzle/database";
import { staysTable } from "../drizzle/schema";

export class StayPostgresRepository implements StayRepository {
  async findWithTenantById(id: string): Promise<WithTenant<Stay> | null> {
    const stay = await db.query.staysTable.findFirst({
      where: eq(staysTable.id, id),
      with: {
        tenant: true,
      },
    });

    if (!stay) {
      return null;
    }

    const tenantEntity = Tenant.reconstitute(stay.tenant);
    const stayEntity = Stay.reconstitute({ ...stay, tenant: tenantEntity });

    return stayEntity as WithTenant<Stay>;
  }

  async save(input: Stay): Promise<Stay> {
    const result = await db.insert(staysTable).values(input.data).returning();

    const stay = result[0];
    if (!stay) throw new Error("Failed to save stay");

    return Stay.reconstitute(stay);
  }

  async findById(id: string): Promise<Stay | null> {
    const stay = await db.query.staysTable.findFirst({
      where: eq(staysTable.id, id),
    });

    if (!stay) return null;

    return Stay.reconstitute(stay);
  }
}
