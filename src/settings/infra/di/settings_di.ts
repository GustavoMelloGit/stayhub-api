import type { AppSettingRepository } from "../../domain/repository/app_setting_repository";
import { CreateAppSettingUseCase } from "../../application/use_case/create_app_setting";
import { GetAppSettingUseCase } from "../../application/use_case/get_app_setting";
import { ListAppSettingsUseCase } from "../../application/use_case/list_app_settings";
import { UpdateAppSettingUseCase } from "../../application/use_case/update_app_setting";
import { DeleteAppSettingUseCase } from "../../application/use_case/delete_app_setting";
import { AppSettingPostgresRepository } from "../database/postgres_repository/app_setting_postgres_repository";
import { CreateAppSettingController } from "../../presentation/controller/create_app_setting.controller";
import { GetAppSettingController } from "../../presentation/controller/get_app_setting.controller";
import { GetAppSettingByKeyController } from "../../presentation/controller/get_app_setting_by_key.controller";
import { ListAppSettingsController } from "../../presentation/controller/list_app_settings.controller";
import { UpdateAppSettingController } from "../../presentation/controller/update_app_setting.controller";
import { DeleteAppSettingController } from "../../presentation/controller/delete_app_setting.controller";

export class SettingsDi {
  #appSettingRepository: AppSettingRepository;

  constructor() {
    this.#appSettingRepository = new AppSettingPostgresRepository();
  }

  // Use Cases

  makeCreateAppSettingUseCase() {
    return new CreateAppSettingUseCase(this.#appSettingRepository);
  }

  makeGetAppSettingUseCase() {
    return new GetAppSettingUseCase(this.#appSettingRepository);
  }

  makeListAppSettingsUseCase() {
    return new ListAppSettingsUseCase(this.#appSettingRepository);
  }

  makeUpdateAppSettingUseCase() {
    return new UpdateAppSettingUseCase(this.#appSettingRepository);
  }

  makeDeleteAppSettingUseCase() {
    return new DeleteAppSettingUseCase(this.#appSettingRepository);
  }

  // Controllers

  makeCreateAppSettingController() {
    return new CreateAppSettingController(this.makeCreateAppSettingUseCase());
  }

  makeGetAppSettingController() {
    return new GetAppSettingController(this.makeGetAppSettingUseCase());
  }

  makeGetAppSettingByKeyController() {
    return new GetAppSettingByKeyController(this.makeGetAppSettingUseCase());
  }

  makeListAppSettingsController() {
    return new ListAppSettingsController(this.makeListAppSettingsUseCase());
  }

  makeUpdateAppSettingController() {
    return new UpdateAppSettingController(this.makeUpdateAppSettingUseCase());
  }

  makeDeleteAppSettingController() {
    return new DeleteAppSettingController(this.makeDeleteAppSettingUseCase());
  }
}
