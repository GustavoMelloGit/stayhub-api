import type { User } from "../../../domain/entity/user";
import { Tenant } from "../../../domain/entity/tenant";
import type { BookingPolicy } from "../../../domain/policies/booking_policy";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import type { UseCase } from "../use_case";

type Input = {
  guests: number;
  property_id: string;
  entrance_code: string;
  check_in: Date;
  check_out: Date;
  tenant: {
    name: string;
    phone: string;
    sex: "MALE" | "FEMALE" | "OTHER";
  };
};

type Output = {
  id: string;
  guests: number;
  entrance_code: string;
  tenant_id: string;
  check_in: Date;
  check_out: Date;
};

export class BookStayUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly stayRepository: StayRepository,
    private readonly bookingPolicy: BookingPolicy,
  ) {}

  async execute(input: Input, user: User): Promise<Output> {
    const property = await this.propertyRepository.propertyOfId(
      input.property_id,
    );

    if (!property) {
      throw new ResourceNotFoundError("Property");
    }

    const userOwnProperty = property?.user_id === user.id;

    if (!userOwnProperty) {
      throw new ResourceNotFoundError("Property");
    }

    let tenant = await this.tenantRepository.findByPhone(input.tenant.phone);

    if (!tenant) {
      const newTenant = Tenant.create(input.tenant);
      tenant = await this.tenantRepository.save(newTenant);
    }

    const stayInput = {
      guests: input.guests,
      tenant_id: tenant.id,
      property_id: input.property_id,
      entrance_code: input.entrance_code,
      check_in: input.check_in,
      check_out: input.check_out,
    };

    const stay = await property.bookStay(stayInput, this.bookingPolicy);

    await this.stayRepository.saveStay(stay);

    return {
      id: stay.id,
      entrance_code: stay.entrance_code,
      tenant_id: stay.tenant_id,
      guests: stay.guests,
      check_in: stay.check_in,
      check_out: stay.check_out,
    };
  }
}
