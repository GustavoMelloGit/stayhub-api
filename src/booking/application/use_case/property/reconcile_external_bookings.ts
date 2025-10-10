import type { BookingProperty } from "../../../domain/entity/booking_property";
import type { User } from "../../../../auth/domain/entity/user";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { BookedPeriod } from "../../../domain/value_object/booked_period";
import type { CalendarAdapter } from "../../adapter/calendar_adapter";
import { ResourceNotFoundError } from "../../../../core/application/error/resource_not_found_error";
import type { ExternalBookingSourcesRepository } from "../../../domain/repository/external_booking_source_repository";
import type { UseCase } from "../../../../core/application/use_case/use_case";
import type {
  ExternalBookingSource,
  ExternalBookingSourcePlatformName,
} from "../../../domain/entity/external_booking_source";
import type { Logger } from "../../../../core/application/logger/logger";
import type { BookingPropertyRepository } from "../../../domain/repository/booking_property_repository";

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
    private readonly propertyRepository: BookingPropertyRepository,
    private readonly logger: Logger
  ) {}

  async execute(input: Input) {
    const { user } = input;

    this.logger.info("Reconciling external bookings", { user: user.id });

    const properties = await this.propertyRepository.allFromUser(user.id);
    this.logger.info("Properties found", { properties: properties.length });

    if (!properties) throw new ResourceNotFoundError("Properties");

    const unreconciledBookings = await Promise.all(
      properties.map(async property => this.#reconcileForProperty(property))
    );
    this.logger.info("Unreconciled bookings found", {
      unreconciledBookings: unreconciledBookings.length,
    });

    return unreconciledBookings
      .flat()
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  async #reconcileForProperty(property: BookingProperty) {
    this.logger.info("Reconciling for property", { property: property.id });
    const propertyId = property.id;
    const externalSources =
      await this.externalBookingSourceRepository.allFromProperty(propertyId);
    if (externalSources.length === 0) return [];
    this.logger.info("External sources found", {
      externalSources: externalSources.length,
    });

    const externalBookings = await this.#getExternalBookings(externalSources);

    this.logger.info("External bookings found", {
      externalBookings: externalBookings.length,
    });

    if (!externalBookings) return [];

    const nextStays =
      await this.stayRepository.allFutureFromProperty(propertyId);

    this.logger.info("Next stays found", { nextStays: nextStays.length });

    const unreconciledBookings: Output[] = [];

    externalBookings.forEach(externalBooking => {
      const isAlreadyRegistered = nextStays.some(internalStay => {
        const internalStayDate = internalStay.stay.check_in.toDateString();
        const externalBookingDate = externalBooking.period.start.toDateString();
        const isSameCheckInDay = internalStayDate === externalBookingDate;

        return isSameCheckInDay;
      });

      if (!isAlreadyRegistered) {
        this.logger.info("Unreconciled booking", {
          externalBooking: externalBooking.period.start,
        });
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
    externalSource: ExternalBookingSource
  ): Promise<ExternalBooking[]> {
    this.logger.info("Parsing external source", {
      externalSource: externalSource.platform_name,
    });
    const periods = await this.calendarAdapter.parseFrom(
      externalSource.sync_url
    );
    this.logger.info("Periods found", { periods: periods.length });
    return periods.map(p => ({
      period: p,
      platform: externalSource.platform_name,
    }));
  }

  async #getExternalBookings(
    externalSources: ExternalBookingSource[]
  ): Promise<ExternalBooking[]> {
    this.logger.info("Getting external bookings", {
      externalSources: externalSources.length,
    });
    const externalBookings = await Promise.all(
      externalSources.map(async source => {
        return this.#sourceToBookings(source);
      })
    );

    this.logger.info("External bookings found", {
      externalBookings: externalBookings.length,
    });

    return externalBookings.flat();
  }
}

type ExternalBooking = {
  period: BookedPeriod;
  platform: ExternalBookingSource["platform_name"];
};
