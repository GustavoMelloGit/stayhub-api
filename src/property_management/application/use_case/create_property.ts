import type { UseCase } from "../../../core/application/use_case/use_case";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import { Property } from "../../domain/entity/property";

export type CreatePropertyInput = {
  name: string;
  user_id: string;
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
  images: string[];
  capacity: number;
};

export type CreatePropertyOutput = {
  id: string;
  name: string;
  user_id: string;
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
  images: string[];
  capacity: number;
  created_at: Date;
  updated_at: Date;
};

/**
 * Use case para criar uma nova propriedade
 */
export class CreatePropertyUseCase
  implements UseCase<CreatePropertyInput, CreatePropertyOutput>
{
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    const property = Property.create(input);

    await this.propertyRepository.save(property);

    return {
      id: property.id,
      name: property.name,
      user_id: property.user_id,
      address: property.address.data,
      images: property.images,
      capacity: property.capacity,
      created_at: property.created_at,
      updated_at: property.updated_at,
    };
  }
}
