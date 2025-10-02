import type { Property } from "../../../domain/entity/property";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { ResourceNotFoundError } from "../../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../use_case";

type Input = {
  property_id: string;
  user_id: string;
};

type Output = Property;

export class FindPropertyUseCase implements UseCase<Input, Output> {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(input: Input): Promise<Output> {
    const property = await this.propertyRepository.propertyOfId(
      input.property_id,
    );

    if (!property || property.user_id !== input.user_id) {
      throw new ResourceNotFoundError("Property");
    }

    return property;
  }
}
