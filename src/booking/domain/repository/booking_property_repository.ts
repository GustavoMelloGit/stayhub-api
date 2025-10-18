import type { BookingProperty } from "../entity/booking_property";

export interface BookingPropertyRepository {
  propertyOfId(id: string): Promise<BookingProperty | null>;
  allFromUser(userId: string): Promise<Array<BookingProperty>>;
}
