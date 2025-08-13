import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import { ValidationError } from "../../error/validation_error";
import type { UseCase } from "../use_case";

type Input = {
  guests: number;
  tenant_id: string;
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
    private readonly guestRepository: TenantRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const [tenant, hasUsedPassword] = await Promise.all([
      this.guestRepository.findById(input.tenant_id),
      this.stayRepository.findByPassword(input.password),
    ]);

    if (!tenant) {
      throw new ResourceNotFoundError("Tenant");
    }
    if (hasUsedPassword) {
      throw new ValidationError("Invalid password");
    }

    const stay = await this.stayRepository.save(input);
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
