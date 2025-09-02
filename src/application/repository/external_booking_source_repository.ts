export type ExternalBookingSource = {
  id: string;
  property_id: string;
  platform_name: "AIRBNB" | "BOOKING";
  sync_url: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
};

export interface ExternalBookingSourcesRepository {
  allFromProperty(propertyId: string): Promise<ExternalBookingSource[]>;
}
