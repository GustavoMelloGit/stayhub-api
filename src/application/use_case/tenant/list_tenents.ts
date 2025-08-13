import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import type { UseCase } from "../use_case";

type Output = {
  id: string;
  name: string;
  phone: string;
}[];

export class ListTenantsUseCase implements UseCase {
  constructor(private readonly repository: TenantRepository) {}

  async execute(): Promise<Output> {
    return this.repository.findAll();
  }
}
