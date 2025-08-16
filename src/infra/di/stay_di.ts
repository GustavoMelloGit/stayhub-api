import { CreateStayUseCase } from "../../application/use_case/stay/create_stay";
import { GetStayUseCase } from "../../application/use_case/stay/get_stay";
import type { CalendarRepository } from "../../domain/repository/calendar_repository";
import type { StayRepository } from "../../domain/repository/stay_repository";
import type { TenantRepository } from "../../domain/repository/tenant_repository";
import { CreateStayController } from "../../presentation/controller/stay/create_stay.controller";
import { GetStayController } from "../../presentation/controller/stay/get_stay.controller";
import { CalendarPostgresRepository } from "../database/postgres_repository/calendar_postgres_repository";
import { StayPostgresRepository } from "../database/postgres_repository/stay_postgres_repository";
import { TenantPostgresRepository } from "../database/postgres_repository/tenant_postgres_repository";

export class StayDi {
  #stayRepository: StayRepository;
  #tenantRepository: TenantRepository;
  #calendarRepository: CalendarRepository;

  constructor() {
    this.#stayRepository = new StayPostgresRepository();
    this.#tenantRepository = new TenantPostgresRepository();
    this.#calendarRepository = new CalendarPostgresRepository();
  }

  // Use Cases
  makeGetStayUseCase() {
    return new GetStayUseCase(this.#stayRepository);
  }
  makeCreateStayUseCase() {
    return new CreateStayUseCase(
      this.#stayRepository,
      this.#tenantRepository,
      this.#calendarRepository,
    );
  }

  // Controllers
  makeCreateStayController() {
    return new CreateStayController(this.makeCreateStayUseCase());
  }
  makeGetStayController() {
    return new GetStayController(this.makeGetStayUseCase());
  }
}
