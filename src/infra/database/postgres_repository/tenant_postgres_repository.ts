import { eq } from "drizzle-orm";
import { Tenant } from "../../../domain/entity/tenant";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { db } from "../drizzle/database";
import { tenantsTable } from "../drizzle/schema";

export class TenantPostgresRepository implements TenantRepository {
  async save(input: { name: string; phone: string }): Promise<Tenant> {
    const tenant = await db.insert(tenantsTable).values(input).returning();

    if (!tenant[0]) {
      throw new Error("Failed to save tenant");
    }

    return new Tenant(tenant[0]);
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await db.select().from(tenantsTable);

    return tenants.map((tenant) => new Tenant(tenant));
  }

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await db.query.tenantsTable.findFirst({
      where: eq(tenantsTable.id, id),
    });

    return tenant ? new Tenant(tenant) : null;
  }
}
