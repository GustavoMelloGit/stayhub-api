import type { BookingPolicy } from "../policy/booking_policy";
import type { BaseEntity } from "../../../core/domain/entity/base_entity";
import { Stay } from "./stay";

type CreatePropertyProps = {
  name: string;
  user_id: string;
};

type PropertyProps = CreatePropertyProps & BaseEntity;

/**
 * @kind Entity, Aggregate Root
 */
export class Property implements BaseEntity {
  readonly id: string;
  readonly name: string;
  readonly user_id: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at?: Date | null;

  private constructor(props: PropertyProps) {
    this.id = props.id;
    this.name = props.name;
    this.user_id = props.user_id;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(props: CreatePropertyProps): Property {
    return new Property({
      ...props,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(props: PropertyProps): Property {
    return new Property(props);
  }

  public async bookStay(
    args: BookStayArgs,
    bookingPolicy: BookingPolicy,
  ): Promise<Stay> {
    const { check_in, check_out, guests } = args;

    await bookingPolicy.isBookingAllowed(this.id, check_in, check_out, guests);

    const stay = Stay.create({
      ...args,
      property_id: this.id,
    });

    return stay;
  }

  public get data() {
    return {
      id: this.id,
      name: this.name,
      user_id: this.user_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }
}

type BookStayArgs = {
  check_in: Date;
  check_out: Date;
  tenant_id: string;
  guests: number;
  entrance_code: string;
  price: number;
};
