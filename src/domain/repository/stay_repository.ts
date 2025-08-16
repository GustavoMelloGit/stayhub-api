import type { Stay } from "../entity/stay";
import type { WithTenant } from "../entity/tenant";

export interface StayRepository {
  save(input: Stay): Promise<Stay>;
  findById(id: string): Promise<Stay | null>;
  findWithTenantById(id: string): Promise<WithTenant<Stay> | null>;
}
