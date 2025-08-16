import { eq } from "drizzle-orm";
import { Property } from "../../../domain/entity/property";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { db } from "../drizzle/database";
import { propertiesTable } from "../drizzle/schema";

export class PropertyPostgresRepository implements PropertyRepository {
  async findById(id: string): Promise<Property | null> {
    const property = await db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
    });

    return property ? Property.reconstitute(property) : null;
  }

  async save(input: Property): Promise<Property> {
    const result = await db
      .insert(propertiesTable)
      .values(input.data)
      .returning();

    const property = result[0];

    if (!property) throw new Error("Failed to save property");

    return Property.reconstitute(property);
  }
}
