import { and, between, eq, isNull, or } from "drizzle-orm";
import { ConflictError } from "../../../../core/application/error/conflict_error";
import type { BookingPolicy } from "../../../domain/policy/booking_policy";
import { db } from "../../../../core/infra/database/drizzle/database";
import { staysTable } from "../../../../core/infra/database/drizzle/schema";

export class PostgresBookingPolicy implements BookingPolicy {
  constructor() {}

  async isBookingAllowed(
    property_id: string,
    check_in: Date,
    check_out: Date
  ): Promise<boolean> {
    /**
     * Uma propriedade está ocupada se:
     * - O check-in estiver entre o check-in e check-out de uma estadia
     * - O check-out estiver entre o check-in e check-out de uma estadia
     */
    const isOccupied = await db.query.staysTable.findFirst({
      where: and(
        isNull(staysTable.deleted_at),
        eq(staysTable.property_id, property_id),
        or(
          between(staysTable.check_in, check_in, check_out),
          between(staysTable.check_out, check_in, check_out)
        )
      ),
    });

    if (isOccupied) {
      throw new ConflictError("Property is occupied");
    }

    return true;
  }
}
