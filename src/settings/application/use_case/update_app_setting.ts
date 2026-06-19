import { ResourceNotFoundError } from "../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../core/application/use_case/use_case";
import type { AppSettingType } from "../../domain/entity/app_setting";
import type { AppSettingRepository } from "../../domain/repository/app_setting_repository";

type Input = {
  id: string;
  value?: unknown;
  type?: AppSettingType;
  description?: string | null;
};

type Output = {
  id: string;
  key: string;
  value: unknown;
  type: AppSettingType;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export class UpdateAppSettingUseCase implements UseCase<Input, Output> {
  constructor(private readonly repository: AppSettingRepository) {}

  async execute(input: Input): Promise<Output> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new ResourceNotFoundError("App setting");
    }

    const updated = existing.update({
      value: input.value,
      type: input.type,
      description: input.description,
    });

    await this.repository.update(updated);

    return {
      id: updated.id,
      key: updated.key,
      value: updated.value,
      type: updated.type,
      description: updated.description,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}
