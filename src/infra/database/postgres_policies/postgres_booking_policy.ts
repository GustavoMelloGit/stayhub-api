import { and, between, eq, or } from "drizzle-orm";
import { ConflictError } from "../../../application/error/conflict_error";
import { ValidationError } from "../../../application/error/validation_error";
import type { BookingPolicy } from "../../../domain/policies/booking_policy";
import { db } from "../drizzle/database";
import { staysTable } from "../drizzle/schema";

export class PostgresBookingPolicy implements BookingPolicy {
  constructor() {}

  async isBookingAllowed(
    property_id: string,
    check_in: Date,
    check_out: Date,
    guests: number,
  ): Promise<boolean> {
    const invalidNumberOfGuests = guests < 1 || !Number.isInteger(guests);

    if (invalidNumberOfGuests) {
      throw new ValidationError("Invalid guests");
    }

    const isDateInThePast = check_in < new Date();

    if (isDateInThePast) {
      throw new ValidationError("Check-in date must be in the future");
    }

    if (check_in >= check_out) {
      throw new ValidationError("Check-in date must be before check-out date");
    }

    /**
     * Uma propriedade está ocupada se:
     * - O check-in estiver entre o check-in e check-out de uma estadia
     * - O check-out estiver entre o check-in e check-out de uma estadia
     */
    const isOccupied = await db.query.staysTable.findFirst({
      where: or(
        and(
          eq(staysTable.property_id, property_id),
          between(staysTable.check_in, check_in, check_out),
        ),
        and(
          eq(staysTable.property_id, property_id),
          between(staysTable.check_out, check_in, check_out),
        ),
      ),
    });

    if (isOccupied) {
      throw new ConflictError("Property is occupied");
    }

    return true;
  }
}
