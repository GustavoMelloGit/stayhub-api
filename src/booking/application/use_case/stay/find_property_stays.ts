import type { PropertyRepository } from "../../../domain/repository/property_repository";
import type {
  StayRepository,
  StayWithTenant,
} from "../../../domain/repository/stay_repository";
import { ResourceNotFoundError } from "../../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../use_case";
import type { TenantSex } from "../../../domain/entity/tenant";

type Input = {
  property_id: string;
  user_id: string;
  onlyIncomingStays?: boolean;
};

type Output = {
  stays: Array<{
    id: string;
    check_in: Date;
    check_out: Date;
    entrance_code: string;
    guests: number;
    price: number;
    created_at: Date;
    updated_at: Date;
    tenant: {
      id: string;
      name: string;
      phone: string;
      sex: TenantSex;
      created_at: Date;
      updated_at: Date;
    };
  }>;
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
      const stays = await this.stayRepository.allFutureFromProperty(
        input.property_id,
      );

      return {
        stays: stays.map((stay) => this.#mapStayWithTenant(stay)),
      };
    }

    const stays = await this.stayRepository.allFromProperty(input.property_id);
    return {
      stays: stays.map((stay) => this.#mapStayWithTenant(stay)),
    };
  }

  #mapStayWithTenant(stay: StayWithTenant): Output["stays"][number] {
    return {
      id: stay.stay.id,
      check_in: stay.stay.check_in,
      check_out: stay.stay.check_out,
      entrance_code: stay.stay.entrance_code,
      guests: stay.stay.guests,
      price: stay.stay.price,
      created_at: stay.stay.created_at,
      updated_at: stay.stay.updated_at,
      tenant: {
        id: stay.tenant.id,
        name: stay.tenant.name,
        phone: stay.tenant.phone,
        sex: stay.tenant.sex,
        created_at: stay.tenant.created_at,
        updated_at: stay.tenant.updated_at,
      },
    };
  }
}
