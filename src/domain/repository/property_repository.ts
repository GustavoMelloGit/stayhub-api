import type { Property } from "../entity/property";

export interface PropertyRepository {
  findById(id: string): Promise<Property | null>;
  save(property: Property): Promise<Property>;
}
