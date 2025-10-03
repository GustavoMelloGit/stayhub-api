import type { Stay } from "../entity/stay";
import type { Tenant } from "../entity/tenant";

export interface StayRepository {
  stayOfId(id: string): Promise<Stay | null>;
  saveStay(stay: Stay): Promise<void>;
  allFutureFromProperty(propertyId: string): Promise<Stay[]>;
  allFromProperty(propertyId: string): Promise<Stay[]>;
  tenantWithPhone(phone: string): Promise<Tenant | null>;
}
