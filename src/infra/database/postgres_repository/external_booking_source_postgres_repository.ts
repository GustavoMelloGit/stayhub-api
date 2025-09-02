import { eq } from "drizzle-orm";
import type {
  ExternalBookingSource,
  ExternalBookingSourcesRepository,
} from "../../../application/repository/external_booking_source_repository";
import { db } from "../drizzle/database";
import { externalBookingSources } from "../drizzle/schema";

export class ExternalBookingSourcePostgresRepository
  implements ExternalBookingSourcesRepository
{
  async allFromProperty(propertyId: string): Promise<ExternalBookingSource[]> {
    const calendarSyncs = await db.query.externalBookingSources.findMany({
      where: eq(externalBookingSources.property_id, propertyId),
    });

    return calendarSyncs;
  }
}
