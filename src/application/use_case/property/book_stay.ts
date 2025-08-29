import type { BookingPolicy } from "../../../domain/policies/booking_policy";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type { UseCase } from "../use_case";

type Input = {
  guests: number;
  tenant_id: string;
  property_id: string;
  password: string;
  check_in: Date;
  check_out: Date;
};

type Output = {
  id: string;
  guests: number;
  password: string;
  tenant_id: string;
  check_in: string;
  check_out: string;
};

export class BookStayUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly bookingPolicy: BookingPolicy,
  ) {}

  async execute(input: Input): Promise<Output> {
    const [tenant, property] = await Promise.all([
      this.tenantRepository.tenantOfId(input.tenant_id),
      this.propertyRepository.propertyOfId(input.property_id),
    ]);

    if (!tenant) {
      throw new ResourceNotFoundError("Tenant");
    }

    if (!property) {
      throw new ResourceNotFoundError("Property");
    }

    const stay = await property.bookStay(input, this.bookingPolicy);

    await this.propertyRepository.saveStay(stay);

    return {
      id: stay.id,
      password: stay.password,
      tenant_id: stay.tenant_id,
      guests: stay.guests,
      check_in: stay.check_in.toISOString(),
      check_out: stay.check_out.toISOString(),
    };
  }
}
