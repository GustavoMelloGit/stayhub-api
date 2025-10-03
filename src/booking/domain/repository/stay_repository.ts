import type { Stay } from "../entity/stay";
import type { Tenant } from "../entity/tenant";

export type StayWithTenant = {
  stay: Stay;
  tenant: Tenant;
};

export interface StayRepository {
  stayOfId(id: string): Promise<Stay | null>;
  saveStay(stay: Stay): Promise<void>;
  allFutureFromProperty(propertyId: string): Promise<Array<StayWithTenant>>;
  allFromProperty(propertyId: string): Promise<Array<StayWithTenant>>;
  tenantWithPhone(phone: string): Promise<Tenant | null>;
}
