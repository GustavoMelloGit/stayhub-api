import type { Property } from "../entity/property";
import type { Stay } from "../entity/stay";
import type { WithTenant } from "../entity/tenant";

export interface PropertyRepository {
  propertyOfId(id: string): Promise<Property | null>;
  addProperty(property: Property): Promise<void>;
  stayOfId(id: string, property_id: string): Promise<WithTenant<Stay> | null>;
  saveStay(stay: Stay): Promise<void>;
}
