import type { Property } from "../entity/property";

export interface PropertyRepository {
  propertyOfId(id: string): Promise<Property | null>;
  save(property: Property): Promise<void>;
  allFromUser(userId: string): Promise<Array<Property>>;
}
