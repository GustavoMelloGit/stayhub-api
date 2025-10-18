import type { User } from "../../../../auth/domain/entity/user";
import { Tenant } from "../../../domain/entity/tenant";
import type { BookingPolicy } from "../../../domain/policy/booking_policy";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { ResourceNotFoundError } from "../../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../../core/application/use_case/use_case";
import type { EventDispatcher } from "../../../../core/application/event/event_dispatcher";
import { StayPaymentConfirmedEvent } from "../../../domain/event/stay_payment_confirmed_event";
import type { BookingPropertyRepository } from "../../../domain/repository/booking_property_repository";

type Input = {
  guests: number;
  property_id: string;
  entrance_code: string;
  check_in: Date;
  check_out: Date;
  price: number;
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
  price: number;
};

export class BookStayUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly propertyRepository: BookingPropertyRepository,
    private readonly stayRepository: StayRepository,
    private readonly bookingPolicy: BookingPolicy,
    private readonly eventDispatcher: EventDispatcher
  ) {}

  async execute(input: Input, user: User): Promise<Output> {
    const property = await this.propertyRepository.propertyOfId(
      input.property_id
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
      price: input.price,
    };

    const stay = await property.bookStay(stayInput, this.bookingPolicy);

    await this.stayRepository.saveStay(stay);

    const event = new StayPaymentConfirmedEvent(
      stay.id,
      property.id,
      stay.price
    );
    await this.eventDispatcher.dispatch(event);

    return {
      id: stay.id,
      entrance_code: stay.entrance_code,
      tenant_id: stay.tenant_id,
      guests: stay.guests,
      check_in: stay.check_in,
      check_out: stay.check_out,
      price: stay.price,
    };
  }
}
