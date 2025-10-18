import { GetPublicStayUseCase } from "../../application/use_case/stay/get_public_stay";
import { GetStayUseCase } from "../../application/use_case/stay/get_stay";
import { FindPropertyStaysUseCase } from "../../application/use_case/stay/find_property_stays";
import { CancelStayUseCase } from "../../application/use_case/stay/cancel_stay";
import type { StayRepository } from "../../domain/repository/stay_repository";
import { GetPublicStayController } from "../../presentation/controller/stay/get_public_stay.controller";
import { GetStayController } from "../../presentation/controller/stay/get_stay.controller";
import { FindPropertyStaysController } from "../../presentation/controller/stay/find_property_stays.controller";
import { CancelStayController } from "../../presentation/controller/stay/cancel_stay.controller";
import { StayPostgresRepository } from "../database/postgres_repository/stay_postgres_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";
import type { PropertyRepository } from "../../../property_management/domain/repository/property_repository";
import { PropertyPostgresRepository } from "../../../property_management/infra/database/postgres_repository/property_postgres_repository";
import type { EventDispatcher } from "../../../core/application/event/event_dispatcher";
import { inMemoryEventDispatcher } from "../../../core/infra/event/in_memory_event_dispatcher";

export class StayDi {
  #propertyRepository: PropertyRepository;
  #stayRepository: StayRepository;
  #tenantRepository: TenantRepository;
  #eventDispatcher: EventDispatcher;

  constructor() {
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#stayRepository = new StayPostgresRepository();
    this.#tenantRepository = new TenantPostgresRepository();
    this.#eventDispatcher = inMemoryEventDispatcher;
  }

  // Use Cases
  makeGetStayUseCase() {
    return new GetStayUseCase(
      this.#propertyRepository,
      this.#stayRepository,
      this.#tenantRepository
    );
  }
  makeGetPublicStayUseCase() {
    return new GetPublicStayUseCase(
      this.#stayRepository,
      this.#tenantRepository
    );
  }
  makeFindPropertyStaysUseCase() {
    return new FindPropertyStaysUseCase(
      this.#propertyRepository,
      this.#stayRepository
    );
  }
  makeCancelStayUseCase() {
    return new CancelStayUseCase(
      this.#stayRepository,
      this.#propertyRepository,
      this.#eventDispatcher
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
  makeCancelStayController() {
    return new CancelStayController(this.makeCancelStayUseCase());
  }
}
