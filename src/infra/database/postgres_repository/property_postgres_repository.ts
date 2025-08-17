import { eq } from "drizzle-orm";
import { Property } from "../../../domain/entity/property";
import { Stay } from "../../../domain/entity/stay";
import { Tenant, type WithTenant } from "../../../domain/entity/tenant";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { db } from "../drizzle/database";
import { propertiesTable, staysTable } from "../drizzle/schema";

export class PropertyPostgresRepository implements PropertyRepository {
  async stayOfId(id: string): Promise<WithTenant<Stay> | null> {
    const stay = await db.query.staysTable.findFirst({
      where: eq(staysTable.id, id),
      with: {
        tenant: true,
      },
    });

    if (!stay) {
      return null;
    }

    const stayEntity = Stay.reconstitute(stay);

    return {
      ...stayEntity,
      data: stayEntity.data,
      tenant: Tenant.reconstitute(stay.tenant),
    };
  }

  async saveStay(input: Stay): Promise<void> {
    const result = await db.insert(staysTable).values(input.data).returning();

    if (!result[0]) throw new Error("Failed to save stay");
  }

  async propertyOfId(id: string): Promise<Property | null> {
    const property = await db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
      with: {
        stays: true,
      },
    });

    return property
      ? Property.reconstitute({
          ...property,
          stays: property.stays.map((s) => Stay.reconstitute(s)),
        })
      : null;
  }

  async addProperty(input: Property): Promise<Property> {
    const result = await db
      .insert(propertiesTable)
      .values(input.data)
      .returning();

    const property = result[0];

    if (!property) throw new Error("Failed to save property");

    return Property.reconstitute({
      ...property,
      stays: [],
    });
  }
}
