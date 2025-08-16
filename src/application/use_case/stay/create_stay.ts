import { Stay } from "../../../domain/entity/stay";
import type { CalendarRepository } from "../../../domain/repository/calendar_repository";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type { UseCase } from "../use_case";

type Input = {
  guests: number;
  tenant_id: string;
  calendar_id: string;
  password: string;
  check_in: Date;
  check_out: Date;
};

type Output = {
  id: string;
  guests: number;
  password: string;
  tenant_id: string;
  check_in: string;
  check_out: string;
};

export class CreateStayUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly stayRepository: StayRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly calendarRepository: CalendarRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const tenant = await this.tenantRepository.findById(input.tenant_id);

    if (!tenant) {
      throw new ResourceNotFoundError("Tenant");
    }

    const calendar = await this.calendarRepository.findById(input.calendar_id);

    if (!calendar) {
      throw new ResourceNotFoundError("Calendar");
    }

    const stayToCreate = Stay.create(input);

    const stay = await this.stayRepository.save(stayToCreate);

    return {
      id: stay.id,
      password: stay.password,
      tenant_id: stay.tenant_id,
      guests: stay.guests,
      check_in: stay.check_in.toISOString(),
      check_out: stay.check_out.toISOString(),
    };
  }
}
