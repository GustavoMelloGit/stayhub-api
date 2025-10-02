import type { BookedPeriod } from "../../domain/value_object/booked_period";

export interface CalendarAdapter {
  parseFrom(url: string): Promise<BookedPeriod[]>;
}
