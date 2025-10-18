import { and, eq, gte } from "drizzle-orm";
import { Stay } from "../../../domain/entity/stay";
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
        gte(staysTable.check_in, new Date())
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
