import { formatISO } from "date-fns";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type { UseCase } from "../use_case";

type Input = {
  stay_id: string;
};

type Output = {
  check_in: string;
  check_out: string;
  guests: number;
  id: string;
  password: string;
  tenant: {
    id: string;
    name: string;
    phone: string;
  };
};

export class GetStayUseCase implements UseCase<Input, Output> {
  constructor(private readonly stayRepository: StayRepository) {}

  async execute(input: Input): Promise<Output> {
    const stay = await this.stayRepository.findWithTenantById(input.stay_id);

    if (!stay) {
      throw new ResourceNotFoundError("Stay");
    }

    return {
      id: stay.id,
      check_in: formatISO(stay.check_in),
      check_out: formatISO(stay.check_out),
      guests: stay.guests,
      password: stay.password,
      tenant: stay.tenant.data,
    };
  }
}
