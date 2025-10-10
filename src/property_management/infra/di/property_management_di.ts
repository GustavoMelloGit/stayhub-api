import type { PropertyRepository } from "../../domain/repository/property_repository";
import { UpdatePropertyUseCase } from "../../application/use_case/update_property";
import { UpdatePropertyController } from "../../presentation/controller/update_property.controller";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";

/**
 * Container de injeção de dependência para o BC Property Management
 */
export class PropertyManagementDi {
  #propertyRepository: PropertyRepository;

  constructor() {
    this.#propertyRepository = new PropertyPostgresRepository();
  }

  // Use Cases
  makeUpdatePropertyUseCase() {
    return new UpdatePropertyUseCase(this.#propertyRepository);
  }

  // Controllers
  makeUpdatePropertyController() {
    return new UpdatePropertyController(this.makeUpdatePropertyUseCase());
  }
}
