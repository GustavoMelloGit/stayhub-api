import type { Calendar } from "../entity/calendar";

export interface CalendarRepository {
  findById(id: string): Promise<Calendar | null>;
  save(calendar: Calendar): Promise<Calendar>;
}
