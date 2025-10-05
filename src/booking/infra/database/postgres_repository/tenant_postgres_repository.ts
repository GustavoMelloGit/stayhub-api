import { eq } from "drizzle-orm";
import { Tenant, type TenantData } from "../../../domain/entity/tenant";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import { tenantsTable } from "../../../../core/infra/database/drizzle/schema";

export class TenantPostgresRepository implements TenantRepository {
  async findByPhone(phone: string): Promise<Tenant | null> {
    const tenant = await db.query.tenantsTable.findFirst({
      where: eq(tenantsTable.phone, phone),
    });

    return tenant ? Tenant.reconstitute(tenant) : null;
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const data: TenantData = {
      id: tenant.id,
      name: tenant.name,
      phone: tenant.phone,
      sex: tenant.sex,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
      deleted_at: tenant.deleted_at,
    };
    const result = await db.insert(tenantsTable).values(data).returning();

    if (!result[0]) {
      throw new Error("Failed to save tenant");
    }

    return Tenant.reconstitute(result[0]);
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await db.select().from(tenantsTable);

    return tenants.map(tenant => Tenant.reconstitute(tenant));
  }

  async tenantOfId(id: string): Promise<Tenant | null> {
    const tenant = await db.query.tenantsTable.findFirst({
      where: eq(tenantsTable.id, id),
    });

    return tenant ? Tenant.reconstitute(tenant) : null;
  }
}
