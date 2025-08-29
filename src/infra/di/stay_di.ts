import { GetStayUseCase } from "../../application/use_case/stay/get_stay";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import type { StayRepository } from "../../domain/repository/stay_repository";
import { GetStayController } from "../../presentation/controller/stay/get_stay.controller";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { StayPostgresRepository } from "../database/postgres_repository/stay_postgres_repository";

export class StayDi {
  #propertyRepository: PropertyRepository;
  #stayRepository: StayRepository;

  constructor() {
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#stayRepository = new StayPostgresRepository();
  }

  // Use Cases
  makeGetStayUseCase() {
    return new GetStayUseCase(this.#propertyRepository, this.#stayRepository);
  }

  // Controllers
  makeGetStayController() {
    return new GetStayController(this.makeGetStayUseCase());
  }
}
