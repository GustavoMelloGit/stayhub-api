import { ValidationError } from "../../../core/application/error/validation_error";
import type { BaseEntity } from "../../../core/domain/entity/base_entity";

type StayCreateProps = {
  check_in: Date;
  check_out: Date;
  tenant_id: string;
  property_id: string;
  guests: number;
  entrance_code: string;
  price: number;
};

type StayProps = StayCreateProps & BaseEntity;

/**
 * @kind Entity
 */
export class Stay {
  readonly id: string;
  readonly check_in: Date;
  readonly check_out: Date;
  readonly tenant_id: string;
  readonly property_id: string;
  readonly guests: number;
  readonly entrance_code: string;
  readonly price: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at?: Date | null;

  private constructor(props: StayProps) {
    this.id = props.id;
    this.check_in = props.check_in;
    this.check_out = props.check_out;
    this.tenant_id = props.tenant_id;
    this.property_id = props.property_id;
    this.guests = props.guests;
    this.entrance_code = props.entrance_code;
    this.price = props.price;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(props: StayCreateProps): Stay {
    if (props.check_in >= props.check_out) {
      throw new ValidationError("Check-in date must be before check-out date");
    }

    if (props.guests < 1 || !Number.isInteger(props.guests)) {
      throw new ValidationError("Guests must be an integer greater than zero");
    }

    if (props.price < 0 || !Number.isInteger(props.price)) {
      throw new ValidationError(
        "Price must be a non-negative integer representing cents",
      );
    }

    if (props.entrance_code.length !== 7) {
      throw new ValidationError("Entrance code must be 7 characters long");
    }

    return new Stay({
      ...props,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(props: StayProps): Stay {
    return new Stay(props);
  }

  public get data() {
    return {
      id: this.id,
      check_in: this.check_in,
      check_out: this.check_out,
      tenant_id: this.tenant_id,
      property_id: this.property_id,
      guests: this.guests,
      entrance_code: this.entrance_code,
      price: this.price,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }
}
