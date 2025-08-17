import { BookStayUseCase } from "../../application/use_case/stay/book_stay";
import { GetStayUseCase } from "../../application/use_case/stay/get_stay";
import type { BookingPolicy } from "../../domain/policies/booking_policy";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { BookStayController } from "../../presentation/controller/stay/book_stay.controller";
import { GetStayController } from "../../presentation/controller/stay/get_stay.controller";
import { PostgresBookingPolicy } from "../database/postgres_policies/postgres_booking_policy";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";

export class StayDi {
  #tenantRepository: TenantRepository;
  #propertyRepository: PropertyRepository;
  #bookingPolicy: BookingPolicy;

  constructor() {
    this.#tenantRepository = new TenantPostgresRepository();
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#bookingPolicy = new PostgresBookingPolicy();
  }

  // Use Cases
  makeGetStayUseCase() {
    return new GetStayUseCase(this.#propertyRepository);
  }
  makeBookStayUseCase() {
    return new BookStayUseCase(
      this.#tenantRepository,
      this.#propertyRepository,
      this.#bookingPolicy,
    );
  }

  // Controllers
  makeBookStayController() {
    return new BookStayController(this.makeBookStayUseCase());
  }
  makeGetStayController() {
    return new GetStayController(this.makeGetStayUseCase());
  }
}
