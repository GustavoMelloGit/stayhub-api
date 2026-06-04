import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import type { UseCase } from "../../../../core/application/use_case/use_case";
import type { User } from "../../../../auth/domain/entity/user";

type Output = {
  id: string;
  name: string;
  phone: string;
}[];

export class ListTenantsUseCase implements UseCase<void, Output> {
  constructor(private readonly repository: TenantRepository) {}

  async execute(_input: void, user: User): Promise<Output> {
    return this.repository.findByOwnerProperties(user.id);
  }
}
