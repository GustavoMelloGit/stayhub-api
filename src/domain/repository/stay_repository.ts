import type { Stay } from "../entity/stay";
import type { WithTenant } from "../entity/tenant";

export interface StayRepository {
  stayOfId(id: string): Promise<WithTenant<Stay> | null>;
  saveStay(stay: Stay): Promise<void>;
}
