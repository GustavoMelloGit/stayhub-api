import { and, eq, gte } from "drizzle-orm";
import { Stay, type StayData } from "../../../domain/entity/stay";
import type {
  StayRepository,
  StayWithTenant,
} from "../../../domain/repository/stay_repository";
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
    const data: StayData = {
      id: input.id,
      check_in: input.check_in,
      check_out: input.check_out,
      tenant_id: input.tenant_id,
      property_id: input.property_id,
      guests: input.guests,
      entrance_code: input.entrance_code,
      price: input.price,
      created_at: input.created_at,
      updated_at: input.updated_at,
      deleted_at: input.deleted_at,
    };
    const result = await db.insert(staysTable).values(data).returning();

    if (!result[0]) throw new Error("Failed to save stay");
  }

  async allFutureFromProperty(propertyId: string): Promise<StayWithTenant[]> {
    const stays = await db.query.staysTable.findMany({
      where: and(
        eq(staysTable.property_id, propertyId),
        gte(staysTable.check_out, new Date())
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

  async allFromProperty(propertyId: string): Promise<StayWithTenant[]> {
    const stays = await db.query.staysTable.findMany({
      where: eq(staysTable.property_id, propertyId),
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
