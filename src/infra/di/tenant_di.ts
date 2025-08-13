import { CreateTenantUseCase } from "../../application/use_case/tenant/create_tenant";
import { ListTenantsUseCase } from "../../application/use_case/tenant/list_tenents";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { CreateTenantController } from "../../presentation/controller/tenant/create_tenant_controller";
import { ListTenantsController } from "../../presentation/controller/tenant/list_tenants_controller";
import { TenantFirebaseRepository } from "../database/firebase_repository/tenant_firebase_repository";

export class TenantDi {
  #tenantRepository: TenantRepository;
  constructor() {
    this.#tenantRepository = new TenantFirebaseRepository();
  }

  // Use Cases
  makeCreateTenantUseCase() {
    return new CreateTenantUseCase(this.#tenantRepository);
  }

  makeListTenantsUseCase() {
    return new ListTenantsUseCase(this.#tenantRepository);
  }

  // Controllers
  makeCreateTenantController() {
    return new CreateTenantController(this.makeCreateTenantUseCase());
  }

  makeListTenantsController() {
    return new ListTenantsController(this.makeListTenantsUseCase());
  }
}
