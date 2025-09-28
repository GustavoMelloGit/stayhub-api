import type { StayRepository } from "../../../domain/repository/stay_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type { UseCase } from "../use_case";

type Input = {
  stay_id: string;
};

type Output = {
  check_in: Date;
  check_out: Date;
  entrance_code: string;
  tenant: {
    name: string;
  };
};

export class GetPublicStayUseCase implements UseCase<Input, Output> {
  constructor(private readonly stayRepository: StayRepository) {}
  async execute(input: Input): Promise<Output> {
    const stay = await this.stayRepository.stayOfId(input.stay_id);

    if (!stay) {
      throw new ResourceNotFoundError("Stay");
    }

    return {
      check_in: stay.check_in,
      check_out: stay.check_out,
      entrance_code: stay.entrance_code,
      tenant: {
        name: stay.tenant.data.name,
      },
    };
  }
}
