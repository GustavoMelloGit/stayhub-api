import type { AppSetting } from "../entity/app_setting";
import type {
  PaginatedResult,
  PaginationInput,
} from "../../../core/application/dto/pagination";

export interface AppSettingRepository {
  save(setting: AppSetting): Promise<void>;
  update(setting: AppSetting): Promise<void>;
  findById(id: string): Promise<AppSetting | null>;
  findByKey(key: string): Promise<AppSetting | null>;
  list(pagination: PaginationInput): Promise<PaginatedResult<AppSetting>>;
  delete(setting: AppSetting): Promise<void>;
}
