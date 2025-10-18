import type { PropertyRepository } from "../../domain/repository/property_repository";
import { ResourceNotFoundError } from "../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../core/application/use_case/use_case";
import type { SafeUpdateEntity } from "../../../core/domain/entity/base_entity";
import type { PropertyData } from "../../domain/entity/property";
import type { DeepPartial } from "../../../core/application/types/deep_partial";

type Input = {
  property_id: string;
  user_id: string;
  update_data: DeepPartial<SafeUpdateEntity<PropertyData>>;
};

type Output = {
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
 * Use case para atualizar dados de uma propriedade
 */
export class UpdatePropertyUseCase implements UseCase<Input, Output> {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(input: Input): Promise<Output> {
    const property = await this.propertyRepository.propertyOfId(
      input.property_id
    );

    if (!property || property.user_id !== input.user_id) {
      throw new ResourceNotFoundError("Property");
    }

    property.changeDetails(input.update_data);
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
