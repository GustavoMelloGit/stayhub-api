import { eq } from "drizzle-orm";
import { db } from "../../../../core/infra/database/drizzle/database";
import { BookingProperty } from "../../../domain/entity/booking_property";
import type { BookingPropertyRepository } from "../../../domain/repository/booking_property_repository";
import { propertiesTable } from "../../../../core/infra/database/drizzle/schema";

export class BookingPropertyPostgresRepository
  implements BookingPropertyRepository
{
  async allFromUser(userId: string): Promise<Array<BookingProperty>> {
    const properties = await db.query.propertiesTable.findMany({
      where: eq(propertiesTable.user_id, userId),
    });

    return properties.map(property => BookingProperty.reconstitute(property));
  }
  async propertyOfId(id: string): Promise<BookingProperty | null> {
    const property = await db.query.propertiesTable.findFirst({
      where: eq(propertiesTable.id, id),
    });

    return property ? BookingProperty.reconstitute(property) : null;
  }
}
