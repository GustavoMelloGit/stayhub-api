import { eq } from "drizzle-orm";
import { Property, type PropertyData } from "../../../domain/entity/property";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import { propertiesTable } from "../../../../core/infra/database/drizzle/schema";

/**
 * Implementação PostgreSQL do repositório de propriedades
 */
export class PropertyPostgresRepository implements PropertyRepository {
  async propertyOfId(id: string): Promise<Property | null> {
    const property = await db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
    });

    return property ? Property.reconstitute(property) : null;
  }

  async save(property: Property): Promise<void> {
    const data: PropertyData = {
      id: property.id,
      name: property.name,
      user_id: property.user_id,
      address: property.address,
      number: property.number,
      neighborhood: property.neighborhood,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      country: property.country,
      complement: property.complement,
      images: property.images,
      capacity: property.capacity,
      created_at: property.created_at,
      updated_at: property.updated_at,
      deleted_at: property.deleted_at,
    };

    const result = await db
      .insert(propertiesTable)
      .values(data)
      .onConflictDoUpdate({
        target: propertiesTable.id,
        set: {
          id: data.id,
          name: data.name,
          address: data.address,
          number: data.number,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          country: data.country,
          complement: data.complement,
          images: data.images,
          capacity: data.capacity,
          updated_at: data.updated_at,
          created_at: data.created_at,
          deleted_at: data.deleted_at,
          user_id: data.user_id,
        },
      })
      .returning();

    if (!result[0]) throw new Error("Failed to save property");
  }
}
