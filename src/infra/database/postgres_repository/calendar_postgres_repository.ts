import { eq } from "drizzle-orm";
import { Calendar } from "../../../domain/entity/calendar";
import type { CalendarRepository } from "../../../domain/repository/calendar_repository";
import { db } from "../drizzle/database";
import { calendarsTable } from "../drizzle/schema";

export class CalendarPostgresRepository implements CalendarRepository {
  async findById(id: string): Promise<Calendar | null> {
    const calendar = await db.query.calendarsTable.findFirst({
      where: eq(calendarsTable.id, id),
    });

    return calendar ? Calendar.reconstitute(calendar) : null;
  }

  async save(input: Calendar): Promise<Calendar> {
    const result = await db
      .insert(calendarsTable)
      .values(input.data)
      .returning();

    const calendar = result[0];

    if (!calendar) throw new Error("Failed to save calendar");

    return Calendar.reconstitute(calendar);
  }
}
