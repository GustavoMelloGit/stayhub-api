import type { UseCase } from "../../../core/application/use_case/use_case";
import type {
  PaginatedResult,
  PaginationInput,
} from "../../../core/application/dto/pagination";
import type { AppSettingType } from "../../domain/entity/app_setting";
import type { AppSettingRepository } from "../../domain/repository/app_setting_repository";

type Input = {
  pagination: PaginationInput;
};

type AppSettingDto = {
  id: string;
  key: string;
  value: unknown;
  type: AppSettingType;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

type Output = PaginatedResult<AppSettingDto>;

export class ListAppSettingsUseCase implements UseCase<Input, Output> {
  constructor(private readonly repository: AppSettingRepository) {}

  async execute(input: Input): Promise<Output> {
    const result = await this.repository.list(input.pagination);

    return {
      data: result.data.map(setting => ({
        id: setting.id,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        created_at: setting.created_at,
        updated_at: setting.updated_at,
      })),
      pagination: result.pagination,
    };
  }
}
