import { eq } from "drizzle-orm";
import { type ExternalBookingSourcesRepository } from "../../../domain/repository/external_booking_source_repository";
import { db } from "../drizzle/database";
import { externalBookingSources } from "../drizzle/schema";
import { ExternalBookingSource } from "../../../domain/entity/external_booking_source";

export class ExternalBookingSourcePostgresRepository
  implements ExternalBookingSourcesRepository
{
  async allFromProperty(propertyId: string): Promise<ExternalBookingSource[]> {
    const bookingSources = await db.query.externalBookingSources.findMany({
      where: eq(externalBookingSources.property_id, propertyId),
    });

    return bookingSources.map((bookingSource) =>
      ExternalBookingSource.reconstitute(bookingSource),
    );
  }

  async save(externalBookingSource: ExternalBookingSource): Promise<void> {
    const result = await db
      .insert(externalBookingSources)
      .values(externalBookingSource.data)
      .returning();

    if (!result[0]) {
      throw new Error("Failed to save external booking source");
    }
  }
}
