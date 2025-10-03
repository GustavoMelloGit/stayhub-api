import { eq } from "drizzle-orm";
import { Property } from "../../../domain/entity/property";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import { propertiesTable } from "../../../../core/infra/database/drizzle/schema";

export class PropertyPostgresRepository implements PropertyRepository {
  async propertyOfId(id: string): Promise<Property | null> {
    const property = await db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
      with: {
        stays: true,
      },
    });

    return property ? Property.reconstitute(property) : null;
  }

  async addProperty(input: Property): Promise<void> {
    const result = await db.insert(propertiesTable).values(input).returning();

    if (!result[0]) throw new Error("Failed to save property");
  }

  async allFromUser(userId: string): Promise<Property[]> {
    const properties = await db.query.propertiesTable.findMany({
      where: eq(propertiesTable.user_id, userId),
    });

    return properties.map((property) => Property.reconstitute(property));
  }
}
