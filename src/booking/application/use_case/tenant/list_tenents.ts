import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import type { UseCase } from "../../../../core/application/use_case/use_case";
import type { User } from "../../../../auth/domain/entity/user";

type Input = {
  query?: string;
};

type Output = {
  id: string;
  name: string;
  phone: string;
  sex: string;
}[];

export class ListTenantsUseCase implements UseCase<Input, Output> {
  constructor(private readonly repository: TenantRepository) {}

  async execute(input: Input, user: User): Promise<Output> {
    return this.repository.findByOwnerProperties(user.id, input.query);
  }
}
