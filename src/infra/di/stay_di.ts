import { BookStayUseCase } from "../../application/use_case/stay/book_stay";
import { GetStayUseCase } from "../../application/use_case/stay/get_stay";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import type { StayRepository } from "../../domain/repository/stay_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { BookStayController } from "../../presentation/controller/stay/book_stay.controller";
import { GetStayController } from "../../presentation/controller/stay/get_stay.controller";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { StayPostgresRepository } from "../database/postgres_repository/stay_postgres_repository";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";

export class StayDi {
  #stayRepository: StayRepository;
  #tenantRepository: TenantRepository;
  #propertyRepository: PropertyRepository;

  constructor() {
    this.#stayRepository = new StayPostgresRepository();
    this.#tenantRepository = new TenantPostgresRepository();
    this.#propertyRepository = new PropertyPostgresRepository();
  }

  // Use Cases
  makeGetStayUseCase() {
    return new GetStayUseCase(this.#stayRepository);
  }
  makeBookStayUseCase() {
    return new BookStayUseCase(
      this.#stayRepository,
      this.#tenantRepository,
      this.#propertyRepository,
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
