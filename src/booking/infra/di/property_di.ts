import type { CalendarAdapter } from "../../application/adapter/calendar_adapter";
import type { ExternalBookingSourcesRepository } from "../../domain/repository/external_booking_source_repository";
import { BookStayUseCase } from "../../application/use_case/property/book_stay";
import { CreateExternalBookingSourceUseCase } from "../../application/use_case/property/create_external_booking_source";
import { ReconcileExternalBookingsUseCase } from "../../application/use_case/property/reconcile_external_bookings";
import type { BookingPolicy } from "../../domain/policy/booking_policy";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import type { StayRepository } from "../../domain/repository/stay_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { BookStayController } from "../../presentation/controller/property/book_stay.controller";
import { CreateExternalBookingSourceController } from "../../presentation/controller/property/create_external_booking.controller";
import { ReconcileExternalBookingController } from "../../presentation/controller/property/reconcile_external_booking.controller";
import { ICalendarAdapter } from "../adapter/i_calendar_adapter";
import { PostgresBookingPolicy } from "../database/postgres_policies/postgres_booking_policy";
import { ExternalBookingSourcePostgresRepository } from "../database/postgres_repository/external_booking_source_postgres_repository";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { StayPostgresRepository } from "../database/postgres_repository/stay_postgres_repository";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";
import { FindUserPropertiesController } from "../../presentation/controller/property/find_user_properties.controller";
import { FindUserPropertiesUseCase } from "../../application/use_case/property/find_user_properties";
import { FindPropertyController } from "../../presentation/controller/property/find_property.controller";
import { FindPropertyUseCase } from "../../application/use_case/property/find_property";
import type { EventDispatcher } from "../../../core/application/event/event_dispatcher";
import { inMemoryEventDispatcher } from "../../../core/infra/event/in_memory_event_dispatcher";
import type { Logger } from "../../../core/application/logger/logger";
import { ConsoleLogger } from "../../../core/infra/logger/console_logger";

export class PropertyDi {
  #tenantRepository: TenantRepository;
  #propertyRepository: PropertyRepository;
  #bookingPolicy: BookingPolicy;
  #stayRepository: StayRepository;
  #externalBookingSourceRepository: ExternalBookingSourcesRepository;
  #calendarAdapter: CalendarAdapter;
  #eventDispatcher: EventDispatcher;
  #logger: Logger;

  constructor() {
    this.#logger = new ConsoleLogger();
    this.#tenantRepository = new TenantPostgresRepository();
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#bookingPolicy = new PostgresBookingPolicy();
    this.#stayRepository = new StayPostgresRepository();
    this.#externalBookingSourceRepository =
      new ExternalBookingSourcePostgresRepository();
    this.#calendarAdapter = new ICalendarAdapter();
    this.#eventDispatcher = inMemoryEventDispatcher;
  }

  // Use Cases
  makeBookStayUseCase() {
    return new BookStayUseCase(
      this.#tenantRepository,
      this.#propertyRepository,
      this.#stayRepository,
      this.#bookingPolicy,
      this.#eventDispatcher
    );
  }
  makeReconcileExternalBookingUseCase() {
    return new ReconcileExternalBookingsUseCase(
      this.#externalBookingSourceRepository,
      this.#stayRepository,
      this.#calendarAdapter,
      this.#propertyRepository,
      this.#logger
    );
  }
  makeCreateExternalBookingSourceUseCase() {
    return new CreateExternalBookingSourceUseCase(
      this.#externalBookingSourceRepository,
      this.#propertyRepository
    );
  }
  makeFindUserPropertiesUseCase() {
    return new FindUserPropertiesUseCase(this.#propertyRepository);
  }
  makeFindPropertyUseCase() {
    return new FindPropertyUseCase(this.#propertyRepository);
  }
  // Controllers
  makeBookStayController() {
    return new BookStayController(this.makeBookStayUseCase());
  }
  makeReconcileExternalBookingController() {
    return new ReconcileExternalBookingController(
      this.makeReconcileExternalBookingUseCase()
    );
  }
  makeCreateExternalBookingSourceController() {
    return new CreateExternalBookingSourceController(
      this.makeCreateExternalBookingSourceUseCase()
    );
  }
  makeFindUserPropertiesController() {
    return new FindUserPropertiesController(
      this.makeFindUserPropertiesUseCase()
    );
  }
  makeFindPropertyController() {
    return new FindPropertyController(this.makeFindPropertyUseCase());
  }
}
