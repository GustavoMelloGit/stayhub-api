import type { Tenant } from "../entity/tenant";

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByPhone(phone: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<Tenant>;
  findAll(): Promise<Tenant[]>;
}
