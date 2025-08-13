import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import type { UseCase } from "../use_case";

type Input = {
  name: string;
  phone: string;
};

type Output = {
  id: string;
  name: string;
  phone: string;
};

export class CreateTenantUseCase implements UseCase {
  constructor(private readonly repository: TenantRepository) {}

  async execute(input: Input): Promise<Output> {
    return this.repository.save(input);
  }
}
