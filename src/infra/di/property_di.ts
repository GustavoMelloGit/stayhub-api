import type { CalendarAdapter } from "../../application/adapter/calendar_adapter";
import type { ExternalBookingSourcesRepository } from "../../application/repository/external_booking_source_repository";
import { BookStayUseCase } from "../../application/use_case/property/book_stay";
import { ReconcileExternalBookingsUseCase } from "../../application/use_case/property/reconcile_external_bookings";
import type { BookingPolicy } from "../../domain/policies/booking_policy";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import type { StayRepository } from "../../domain/repository/stay_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { BookStayController } from "../../presentation/controller/property/book_stay.controller";
import { ReconcileExternalBookingController } from "../../presentation/controller/property/reconcile_external_booking.controller";
import { ICalendarAdapter } from "../adapter/i_calendar_adapter";
import { PostgresBookingPolicy } from "../database/postgres_policies/postgres_booking_policy";
import { ExternalBookingSourcePostgresRepository } from "../database/postgres_repository/external_booking_source_postgres_repository";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { StayPostgresRepository } from "../database/postgres_repository/stay_postgres_repository";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";

export class PropertyDi {
  #tenantRepository: TenantRepository;
  #propertyRepository: PropertyRepository;
  #bookingPolicy: BookingPolicy;
  #stayRepository: StayRepository;
  #externalBookingSourceRepository: ExternalBookingSourcesRepository;
  #calendarAdapter: CalendarAdapter;

  constructor() {
    this.#tenantRepository = new TenantPostgresRepository();
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#bookingPolicy = new PostgresBookingPolicy();
    this.#stayRepository = new StayPostgresRepository();
    this.#externalBookingSourceRepository =
      new ExternalBookingSourcePostgresRepository();
    this.#calendarAdapter = new ICalendarAdapter();
  }

  // Use Cases
  makeBookStayUseCase() {
    return new BookStayUseCase(
      this.#tenantRepository,
      this.#propertyRepository,
      this.#stayRepository,
      this.#bookingPolicy,
    );
  }
  makeReconcileExternalBookingUseCase() {
    return new ReconcileExternalBookingsUseCase(
      this.#externalBookingSourceRepository,
      this.#stayRepository,
      this.#calendarAdapter,
      this.#propertyRepository,
    );
  }

  // Controllers
  makeBookStayController() {
    return new BookStayController(this.makeBookStayUseCase());
  }
  makeReconcileExternalBookingController() {
    return new ReconcileExternalBookingController(
      this.makeReconcileExternalBookingUseCase(),
    );
  }
}
