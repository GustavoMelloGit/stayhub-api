import type { ExternalBookingSource } from "../entity/external_booking_source";

export interface ExternalBookingSourcesRepository {
  allFromProperty(propertyId: string): Promise<ExternalBookingSource[]>;
  save(externalBookingSource: ExternalBookingSource): Promise<void>;
}
