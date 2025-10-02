import type { Property } from "../entity/property";

export interface PropertyRepository {
  propertyOfId(id: string): Promise<Property | null>;
  addProperty(property: Property): Promise<void>;
  allFromUser(userId: string): Promise<Property[]>;
}
