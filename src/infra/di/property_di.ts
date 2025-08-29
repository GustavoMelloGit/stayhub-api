import { BookStayUseCase } from "../../application/use_case/property/book_stay";
import type { BookingPolicy } from "../../domain/policies/booking_policy";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import type { StayRepository } from "../../domain/repository/stay_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { BookStayController } from "../../presentation/controller/property/book_stay.controller";
import { PostgresBookingPolicy } from "../database/postgres_policies/postgres_booking_policy";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { StayPostgresRepository } from "../database/postgres_repository/stay_postgres_repository";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";

export class PropertyDi {
  #tenantRepository: TenantRepository;
  #propertyRepository: PropertyRepository;
  #bookingPolicy: BookingPolicy;
  #stayRepository: StayRepository;

  constructor() {
    this.#tenantRepository = new TenantPostgresRepository();
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#bookingPolicy = new PostgresBookingPolicy();
    this.#stayRepository = new StayPostgresRepository();
  }

  makeBookStayUseCase() {
    return new BookStayUseCase(
      this.#tenantRepository,
      this.#propertyRepository,
      this.#stayRepository,
      this.#bookingPolicy,
    );
  }

  // Controllers
  makeBookStayController() {
    return new BookStayController(this.makeBookStayUseCase());
  }
}
