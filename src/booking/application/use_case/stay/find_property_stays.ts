import type {
  StayRepository,
  StayWithTenant,
} from "../../../domain/repository/stay_repository";
import { ResourceNotFoundError } from "../../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../../core/application/use_case/use_case";
import type { TenantSex } from "../../../domain/entity/tenant";
import type { PropertyRepository } from "../../../../property_management/domain/repository/property_repository";
import {
  type PaginatedResult,
  type PaginationInput,
} from "../../../../core/application/dto/pagination";

export class FindPropertyStaysUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly stayRepository: StayRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const property = await this.propertyRepository.propertyOfId(
      input.property_id
    );

    if (!property || property.user_id !== input.user_id) {
      throw new ResourceNotFoundError("Property");
    }

    const { data, pagination } = await this.stayRepository.allFromProperty(
      input.property_id,
      input.pagination,
      {
        onlyIncomingStays: input.filters.onlyIncomingStays ?? false,
      }
    );

    return {
      data: data.map(stay => this.#mapStayWithTenant(stay)),
      pagination,
    };
  }

  #mapStayWithTenant({ stay, tenant }: StayWithTenant): Output["data"][number] {
    return {
      id: stay.id,
      check_in: stay.check_in,
      check_out: stay.check_out,
      entrance_code: stay.entrance_code,
      guests: stay.guests,
      price: stay.price,
      source: stay.source,
      created_at: stay.created_at,
      updated_at: stay.updated_at,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        sex: tenant.sex,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
      },
    };
  }
}

type InputFilters = {
  onlyIncomingStays: boolean;
};

type Input = {
  property_id: string;
  user_id: string;
  pagination: PaginationInput;
  filters: InputFilters;
};

type Output = PaginatedResult<{
  id: string;
  check_in: Date;
  check_out: Date;
  entrance_code: string;
  guests: number;
  price: number;
  source: string;
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
