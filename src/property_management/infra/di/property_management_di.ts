import type { PropertyRepository } from "../../domain/repository/property_repository";
import { UpdatePropertyUseCase } from "../../application/use_case/update_property";
import { UpdatePropertyController } from "../../presentation/controller/update_property.controller";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { FindUserPropertiesUseCase } from "../../application/use_case/find_user_properties";
import { FindUserPropertiesController } from "../../presentation/controller/find_user_properties.controller";
import { FindPropertyUseCase } from "../../application/use_case/find_property";
import { FindPropertyController } from "../../presentation/controller/find_property.controller";
import { CreatePropertyUseCase } from "../../application/use_case/create_property";
import { CreatePropertyController } from "../../presentation/controller/create_property.controller";

export class PropertyManagementDi {
  #propertyRepository: PropertyRepository;

  constructor() {
    this.#propertyRepository = new PropertyPostgresRepository();
  }

  // Use Cases
  makeCreatePropertyUseCase() {
    return new CreatePropertyUseCase(this.#propertyRepository);
  }
  makeUpdatePropertyUseCase() {
    return new UpdatePropertyUseCase(this.#propertyRepository);
  }
  makeFindUserPropertiesUseCase() {
    return new FindUserPropertiesUseCase(this.#propertyRepository);
  }
  makeFindPropertyUseCase() {
    return new FindPropertyUseCase(this.#propertyRepository);
  }

  // Controllers
  makeCreatePropertyController() {
    return new CreatePropertyController(this.makeCreatePropertyUseCase());
  }
  makeUpdatePropertyController() {
    return new UpdatePropertyController(this.makeUpdatePropertyUseCase());
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
