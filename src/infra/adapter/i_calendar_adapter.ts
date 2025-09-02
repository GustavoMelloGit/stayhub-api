import type { CalendarAdapter } from "../../application/adapter/calendar_adapter";
import { BookedPeriod } from "../../domain/value_object/booked_period";
import ical from "node-ical";

export class ICalendarAdapter implements CalendarAdapter {
  async parseFrom(url: string): Promise<BookedPeriod[]> {
    const events = await ical.async.fromURL(url);
    const bookedPeriods: BookedPeriod[] = [];

    for (const event of Object.values(events)) {
      if (event.type === "VEVENT" && event.start && event.end) {
        bookedPeriods.push(
          new BookedPeriod(new Date(event.start), new Date(event.end)),
        );
      }
    }
    return bookedPeriods;
  }
}
