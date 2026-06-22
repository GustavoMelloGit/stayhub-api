import { ResourceNotFoundError } from "../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../core/application/use_case/use_case";
import type { AppSettingType } from "../../domain/entity/app_setting";
import type { AppSettingRepository } from "../../domain/repository/app_setting_repository";

type Input = {
  id?: string;
  key?: string;
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

export class GetAppSettingUseCase implements UseCase<Input, Output> {
  constructor(private readonly repository: AppSettingRepository) {}

  async execute(input: Input): Promise<Output> {
    const setting = input.id
      ? await this.repository.findById(input.id)
      : input.key
        ? await this.repository.findByKey(input.key)
        : null;

    if (!setting) {
      throw new ResourceNotFoundError("App setting");
    }

    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      type: setting.type,
      description: setting.description,
      created_at: setting.created_at,
      updated_at: setting.updated_at,
    };
  }
}
