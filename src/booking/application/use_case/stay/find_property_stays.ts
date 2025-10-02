import type { PropertyRepository } from "../../../domain/repository/property_repository";
import type { Stay } from "../../../domain/entity/stay";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { WithTenant } from "../../../domain/entity/tenant";
import { ResourceNotFoundError } from "../../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../use_case";

type Input = {
  property_id: string;
  user_id: string;
  onlyIncomingStays?: boolean;
};

type Output = {
  stays: WithTenant<Stay>[];
};

/**
 * Use case para buscar todas as estadias de uma propriedade específica
 */
export class FindPropertyStaysUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly stayRepository: StayRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    // Verifica se a propriedade existe e pertence ao usuário
    const property = await this.propertyRepository.propertyOfId(
      input.property_id,
    );

    if (!property || property.user_id !== input.user_id) {
      throw new ResourceNotFoundError("Property");
    }

    // Busca as estadias baseado no filtro
    if (input.onlyIncomingStays) {
      return {
        stays: await this.stayRepository.allFutureFromProperty(
          input.property_id,
        ),
      };
    }

    return {
      stays: await this.stayRepository.allFromProperty(input.property_id),
    };
  }
}
