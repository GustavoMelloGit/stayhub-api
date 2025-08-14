import type { Stay } from "../entity/stay";
import type { WithTenant } from "../entity/tenant";

export interface StayRepository {
  save(input: Omit<SaveStayDto, "id">): Promise<SaveStayDto>;
  findById(id: string): Promise<Stay | null>;
  findWithTenantById(id: string): Promise<WithTenant<Stay> | null>;
}

export type SaveStayDto = {
  id: string;
  tenant_id: string;
  check_in: Date;
  check_out: Date;
  guests: number;
  password: string;
};
