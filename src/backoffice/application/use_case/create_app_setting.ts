import { ConflictError } from "../../../core/application/error/conflict_error";
import type { UseCase } from "../../../core/application/use_case/use_case";
import {
  AppSetting,
  type AppSettingType,
} from "../../domain/entity/app_setting";
import type { AppSettingRepository } from "../../domain/repository/app_setting_repository";

type Input = {
  key: string;
  value: unknown;
  type: AppSettingType;
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

export class CreateAppSettingUseCase implements UseCase<Input, Output> {
  constructor(private readonly repository: AppSettingRepository) {}

  async execute(input: Input): Promise<Output> {
    const existing = await this.repository.findByKey(input.key);
    if (existing) {
      throw new ConflictError("App setting key already exists");
    }

    const setting = AppSetting.create({
      key: input.key,
      value: input.value,
      type: input.type,
      description: input.description ?? null,
    });

    await this.repository.save(setting);

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
