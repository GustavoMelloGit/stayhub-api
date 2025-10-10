import { eq } from "drizzle-orm";
import { Property, type PropertyData } from "../../../domain/entity/property";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import {
  propertiesTable,
  addressesTable,
} from "../../../../core/infra/database/drizzle/schema";
import { Address } from "../../../domain/value_object/address";

export class PropertyPostgresRepository implements PropertyRepository {
  async propertyOfId(id: string): Promise<Property | null> {
    const property = await db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
      with: {
        address: true,
      },
    });

    if (!property) return null;

    // Reconstrói a propriedade com o endereço como objeto
    const propertyData: PropertyData = {
      id: property.id,
      name: property.name,
      user_id: property.user_id,
      address: {
        street: property.address.street,
        number: property.address.number,
        neighborhood: property.address.neighborhood,
        city: property.address.city,
        state: property.address.state,
        zip_code: property.address.zip_code,
        country: property.address.country,
        complement: property.address.complement,
      },
      images: property.images,
      capacity: property.capacity,
      created_at: property.created_at,
      updated_at: property.updated_at,
      deleted_at: property.deleted_at,
    };

    return Property.reconstitute(propertyData);
  }

  async save(input: Property): Promise<void> {
    const propertyAlreadyExists = await this.propertyOfId(input.id);
    if (propertyAlreadyExists) {
      await this.#updateProperty(input);
    } else {
      await this.#createProperty(input);
    }
  }

  async allFromUser(userId: string): Promise<Array<Property>> {
    const properties = await db.query.propertiesTable.findMany({
      where: eq(propertiesTable.user_id, userId),
      with: {
        address: true,
      },
    });
    return properties.map(property => Property.reconstitute(property));
  }

  async #createAddress(
    address: Address
  ): Promise<{ value: Address; id: string }> {
    const addressResult = await db
      .insert(addressesTable)
      .values(address.data)
      .returning();
    if (!addressResult[0]) throw new Error("Failed to create address");

    return {
      value: Address.reconstitute(addressResult[0]),
      id: addressResult[0].id,
    };
  }

  async #updateAddress(addressId: string, address: Address): Promise<void> {
    const addressResult = await db
      .update(addressesTable)
      .set(address.data)
      .where(eq(addressesTable.id, addressId))
      .returning();

    if (!addressResult[0]) throw new Error("Failed to update address");
  }

  async #createProperty(property: Property): Promise<Property> {
    const address = await this.#createAddress(property.address);
    const propertyResult = await db
      .insert(propertiesTable)
      .values({
        ...property.data,
        address_id: address.id,
      })
      .returning();

    if (!propertyResult[0]) throw new Error("Failed to create property");

    return property;
  }

  async #updateProperty(property: Property): Promise<void> {
    const propertyResult = await db
      .update(propertiesTable)
      .set(property.data)
      .where(eq(propertiesTable.id, property.id))
      .returning();

    const propertyDto = propertyResult[0];
    if (!propertyDto) throw new Error("Failed to update property");

    await this.#updateAddress(propertyDto.address_id, property.address);
  }
}
