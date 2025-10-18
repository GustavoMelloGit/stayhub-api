import { ResourceNotFoundError } from "../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../core/application/use_case/use_case";
import type { PropertyRepository } from "../../domain/repository/property_repository";

type Input = {
  property_id: string;
  user_id: string;
};

type Output = {
  id: string;
  name: string;
  capacity: number;
  images: string[];
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    complement: string;
  };
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

export class FindPropertyUseCase implements UseCase<Input, Output> {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(input: Input): Promise<Output> {
    const property = await this.propertyRepository.propertyOfId(
      input.property_id
    );

    if (!property || property.user_id !== input.user_id) {
      throw new ResourceNotFoundError("Property");
    }

    return {
      id: property.id,
      name: property.name,
      capacity: property.capacity,
      images: property.images,
      address: property.address.data,
      user_id: property.user_id,
      created_at: property.created_at,
      updated_at: property.updated_at,
    };
  }
}
