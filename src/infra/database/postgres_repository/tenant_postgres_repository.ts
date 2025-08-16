import { eq } from "drizzle-orm";
import { ConflictError } from "../../../application/error/conflict_error";
import { Tenant } from "../../../domain/entity/tenant";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { db } from "../drizzle/database";
import { tenantsTable } from "../drizzle/schema";

export class TenantPostgresRepository implements TenantRepository {
  async findByPhone(phone: string): Promise<Tenant | null> {
    const tenant = await db.query.tenantsTable.findFirst({
      where: eq(tenantsTable.phone, phone),
    });

    return tenant ? Tenant.reconstitute(tenant) : null;
  }

  async save(input: { name: string; phone: string }): Promise<Tenant> {
    const hasTenant = await this.findByPhone(input.phone);

    if (hasTenant) {
      throw new ConflictError("Tenant already exists");
    }

    const entity = Tenant.create(input);

    const tenant = await db
      .insert(tenantsTable)
      .values(entity.data)
      .returning();

    if (!tenant[0]) {
      throw new Error("Failed to save tenant");
    }

    return Tenant.reconstitute(tenant[0]);
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await db.select().from(tenantsTable);

    return tenants.map((tenant) => Tenant.reconstitute(tenant));
  }

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await db.query.tenantsTable.findFirst({
      where: eq(tenantsTable.id, id),
    });

    return tenant ? Tenant.reconstitute(tenant) : null;
  }
}
