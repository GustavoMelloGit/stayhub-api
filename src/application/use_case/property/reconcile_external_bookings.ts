// src/application/use-case/reconcile-external-bookings.ts

import type { Property } from "../../../domain/entity/property";
import type { User } from "../../../domain/entity/user";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { BookedPeriod } from "../../../domain/value_object/booked_period";
import type { CalendarAdapter } from "../../adapter/calendar_adapter";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type { ExternalBookingSourcesRepository } from "../../../domain/repository/external_booking_source_repository";
import type { UseCase } from "../use_case";
import type {
  ExternalBookingSource,
  ExternalBookingSourcePlatformName,
} from "../../../domain/entity/external_booking_source";

type Input = {
  user: User;
};

type Output = {
  start: Date;
  end: Date;
  sourcePlatform: ExternalBookingSourcePlatformName;
  property: {
    id: string;
    name: string;
  };
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
    const { user } = input;

    const properties = await this.propertyRepository.allFromUser(user.id);
    if (!properties) throw new ResourceNotFoundError("Properties");

    const unreconciledBookings = await Promise.all(
      properties.map(async (property) => this.#reconcileForProperty(property)),
    );

    return unreconciledBookings.flat();
  }

  async #reconcileForProperty(property: Property) {
    const propertyId = property.id;
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
          property: {
            id: property.id,
            name: property.name,
          },
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
    const externalBookings = await Promise.all(
      externalSources.map(async (source) => {
        return this.#sourceToBookings(source);
      }),
    );

    return externalBookings.flat();
  }
}

type ExternalBooking = {
  period: BookedPeriod;
  platform: ExternalBookingSource["platform_name"];
};
