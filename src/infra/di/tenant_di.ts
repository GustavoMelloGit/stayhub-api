import { ListTenantsUseCase } from "../../application/use_case/tenant/list_tenents";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { ListTenantsController } from "../../presentation/controller/tenant/list_tenants.controller";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";

export class TenantDi {
  #tenantRepository: TenantRepository;
  constructor() {
    this.#tenantRepository = new TenantPostgresRepository();
  }

  // Use Cases
  makeListTenantsUseCase() {
    return new ListTenantsUseCase(this.#tenantRepository);
  }

  // Controllers
  makeListTenantsController() {
    return new ListTenantsController(this.makeListTenantsUseCase());
  }
}
