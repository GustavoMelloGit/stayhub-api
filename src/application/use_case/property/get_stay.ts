import { formatISO } from "date-fns";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type { UseCase } from "../use_case";
import type { User } from "../../../domain/entity/user";

type Input = {
  stay_id: string;
  property_id: string;
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
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(input: Input, user: User): Promise<Output> {
    const stay = await this.propertyRepository.stayOfId(
      input.stay_id,
      input.property_id,
    );

    if (!stay) {
      throw new ResourceNotFoundError("Stay");
    }

    const property = await this.propertyRepository.propertyOfId(
      input.property_id,
    );

    if (!property) {
      throw new ResourceNotFoundError("Property");
    }

    const userOwnsProperty = property.user_id === user.id;
    if (!userOwnsProperty) {
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
