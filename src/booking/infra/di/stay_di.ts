import { GetPublicStayUseCase } from "../../application/use_case/stay/get_public_stay";
import { GetStayUseCase } from "../../application/use_case/stay/get_stay";
import { FindPropertyStaysUseCase } from "../../application/use_case/stay/find_property_stays";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import type { StayRepository } from "../../domain/repository/stay_repository";
import { GetPublicStayController } from "../../presentation/controller/stay/get_public_stay.controller";
import { GetStayController } from "../../presentation/controller/stay/get_stay.controller";
import { FindPropertyStaysController } from "../../presentation/controller/stay/find_property_stays.controller";
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
  makeGetPublicStayUseCase() {
    return new GetPublicStayUseCase(this.#stayRepository);
  }
  makeFindPropertyStaysUseCase() {
    return new FindPropertyStaysUseCase(
      this.#propertyRepository,
      this.#stayRepository,
    );
  }

  // Controllers
  makeGetStayController() {
    return new GetStayController(this.makeGetStayUseCase());
  }
  makeGetPublicStayController() {
    return new GetPublicStayController(this.makeGetPublicStayUseCase());
  }
  makeFindPropertyStaysController() {
    return new FindPropertyStaysController(this.makeFindPropertyStaysUseCase());
  }
}
