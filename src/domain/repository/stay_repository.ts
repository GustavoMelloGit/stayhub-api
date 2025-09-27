import type { Stay } from "../entity/stay";
import type { WithTenant } from "../entity/tenant";

export interface StayRepository {
  stayOfId(id: string): Promise<WithTenant<Stay> | null>;
  saveStay(stay: Stay): Promise<void>;
  allFutureFromProperty(propertyId: string): Promise<WithTenant<Stay>[]>;
  allFromProperty(propertyId: string): Promise<WithTenant<Stay>[]>;
}
