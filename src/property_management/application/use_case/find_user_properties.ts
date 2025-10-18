import type { UseCase } from "../../../core/application/use_case/use_case";
import type { PropertyRepository } from "../../domain/repository/property_repository";

type Input = {
  user_id: string;
};

type Output = {
  properties: Array<{ name: string; id: string }>;
};

export class FindUserPropertiesUseCase implements UseCase<Input, Output> {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(input: Input): Promise<Output> {
    const properties = await this.propertyRepository.allFromUser(input.user_id);
    return {
      properties: properties.map(property => ({
        name: property.name,
        id: property.id,
      })),
    };
  }
}
