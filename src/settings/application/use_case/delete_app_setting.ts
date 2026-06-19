import { ResourceNotFoundError } from "../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../core/application/use_case/use_case";
import type { AppSettingRepository } from "../../domain/repository/app_setting_repository";

type Input = {
  id: string;
};

type Output = void;

export class DeleteAppSettingUseCase implements UseCase<Input, Output> {
  constructor(private readonly repository: AppSettingRepository) {}

  async execute(input: Input): Promise<Output> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new ResourceNotFoundError("App setting");
    }

    const deleted = existing.softDelete();
    await this.repository.delete(deleted);
  }
}
