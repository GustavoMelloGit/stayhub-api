import type { Tenant } from "../entity/tenant";

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByPhone(phone: string): Promise<Tenant | null>;
  save(input: { name: string; phone: string }): Promise<Tenant>;
  findAll(): Promise<Tenant[]>;
}
