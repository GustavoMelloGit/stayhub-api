import type { User } from "../../domain/entity/user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { UseCase } from "../../../core/application/use_case/use_case";
import { ResourceNotFoundError } from "../../../core/application/error/resource_not_found_error";

export class PurgeUserDataUseCase implements UseCase<void, void> {
  constructor(private readonly repository: AuthRepository) {}

  async execute(_input: void, user: User): Promise<void> {
    const existing = await this.repository.findUserById(user.id);

    if (!existing) {
      throw new ResourceNotFoundError("User");
    }

    await this.repository.purgeUserData(user.id);
  }
}
