import type { Tenant } from '../entity/tenant';

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  isDuplicate(tenant: Tenant): Promise<boolean>;
  save(input: { name: string; phone: string }): Promise<Tenant>;
  findAll(): Promise<Tenant[]>;
}
