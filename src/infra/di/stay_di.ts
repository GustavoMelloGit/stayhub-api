import { CreateStayUseCase } from "../../application/use_case/stay/create_stay";
import { GetStayUseCase } from "../../application/use_case/stay/get_stay";
import type { StayRepository } from "../../domain/repository/stay_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { CreateStayController } from "../../presentation/controller/stay/create_stay_controller";
import { GetStayController } from "../../presentation/controller/stay/get_stay_controller";
import { StayFirebaseRepository } from "../database/firebase_repository/stay_firebase_repository";
import { TenantFirebaseRepository } from "../database/firebase_repository/tenant_firebase_repository";

export class StayDi {
  #stayRepository: StayRepository;
  #tenantRepository: TenantRepository;

  constructor() {
    this.#stayRepository = new StayFirebaseRepository();
    this.#tenantRepository = new TenantFirebaseRepository();
  }

  // Use Cases
  makeGetStayUseCase() {
    return new GetStayUseCase(this.#stayRepository, this.#tenantRepository);
  }
  makeCreateStayUseCase() {
    return new CreateStayUseCase(this.#stayRepository, this.#tenantRepository);
  }

  // Controllers
  makeCreateStayController() {
    return new CreateStayController(this.makeCreateStayUseCase());
  }
  makeGetStayController() {
    return new GetStayController(this.makeGetStayUseCase());
  }
}
