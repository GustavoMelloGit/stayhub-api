// src/application/use-case/reconcile-external-bookings.ts

import type { User } from "../../../domain/entity/user";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { BookedPeriod } from "../../../domain/value_object/booked_period";
import type { CalendarAdapter } from "../../adapter/calendar_adapter";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type {
  ExternalBookingSource,
  ExternalBookingSourcesRepository,
} from "../../repository/external_booking_source_repository";
import type { UseCase } from "../use_case";

type Input = {
  propertyId: string;
  user: User;
};

type Output = {
  start: Date;
  end: Date;
  sourcePlatform: ExternalBookingSource["platform_name"];
};

export class ReconcileExternalBookingsUseCase
  implements UseCase<Input, Output[]>
{
  constructor(
    private readonly externalBookingSourceRepository: ExternalBookingSourcesRepository,
    private readonly stayRepository: StayRepository,
    private readonly calendarAdapter: CalendarAdapter,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async execute(input: Input) {
    const { propertyId, user } = input;

    const property = await this.propertyRepository.propertyOfId(propertyId);
    if (!property) throw new ResourceNotFoundError("Property");

    const userOwnsProperty = property.user_id === user.id;
    if (!userOwnsProperty) throw new ResourceNotFoundError("Property");

    const externalSources =
      await this.externalBookingSourceRepository.allFromProperty(propertyId);
    if (externalSources.length === 0) return [];

    const externalBookings = await this.#getExternalBookings(externalSources);

    if (!externalBookings) return [];

    const nextStays =
      await this.stayRepository.allFutureFromProperty(propertyId);

    const unreconciledBookings: Output[] = [];

    externalBookings.forEach((externalBooking) => {
      const isAlreadyRegistered = nextStays.some((internalStay) => {
        const internalStayDate = internalStay.check_in.toDateString();
        const externalBookingDate = externalBooking.period.start.toDateString();
        const isSameCheckInDay = internalStayDate === externalBookingDate;

        return isSameCheckInDay;
      });

      if (!isAlreadyRegistered) {
        unreconciledBookings.push({
          start: externalBooking.period.start,
          end: externalBooking.period.end,
          sourcePlatform: externalBooking.platform,
        });
      }
    });

    return unreconciledBookings;
  }

  async #sourceToBookings(
    externalSource: ExternalBookingSource,
  ): Promise<ExternalBooking[]> {
    const periods = await this.calendarAdapter.parseFrom(
      externalSource.sync_url,
    );
    return periods.map((p) => ({
      period: p,
      platform: externalSource.platform_name,
    }));
  }

  async #getExternalBookings(
    externalSources: ExternalBookingSource[],
  ): Promise<ExternalBooking[]> {
    const [externalBookings] = await Promise.all(
      externalSources.map(async (source) => {
        return this.#sourceToBookings(source);
      }),
    );

    return externalBookings ?? [];
  }
}

type ExternalBooking = {
  period: BookedPeriod;
  platform: ExternalBookingSource["platform_name"];
};
