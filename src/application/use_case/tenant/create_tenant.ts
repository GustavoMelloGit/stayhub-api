import { Tenant, type Sex } from "../../../domain/entity/tenant";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { ConflictError } from "../../error/conflict_error";
import type { UseCase } from "../use_case";

type Input = {
  name: string;
  phone: string;
  sex: Sex;
};

type Output = {
  id: string;
  name: string;
  phone: string;
};

export class CreateTenantUseCase implements UseCase {
  constructor(private readonly repository: TenantRepository) {}

  async execute(input: Input): Promise<Output> {
    const hasTenant = await this.repository.findByPhone(input.phone);

    if (hasTenant) {
      throw new ConflictError("Tenant already exists");
    }

    const entity = Tenant.create(input);
    return this.repository.save(entity);
  }
}
