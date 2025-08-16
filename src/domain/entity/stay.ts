import { randomUUID } from "node:crypto";
import { ValidationError } from "../../application/error/validation_error";
import type { BaseEntity } from "./base_entity";
import type { Tenant } from "./tenant";

type StayCreateProps = {
  check_in: Date;
  check_out: Date;
  tenant_id: string;
  guests: number;
  password: string;
};

type StayProps = StayCreateProps &
  BaseEntity & {
    tenant?: Tenant;
  };

export class Stay {
  readonly id: string;
  readonly check_in: Date;
  readonly check_out: Date;
  readonly tenant_id: string;
  readonly guests: number;
  readonly password: string;
  readonly tenant?: Tenant;

  private constructor(props: StayProps) {
    this.id = props.id;
    this.check_in = props.check_in;
    this.check_out = props.check_out;
    this.tenant_id = props.tenant_id;
    this.guests = props.guests;
    this.password = props.password;
    this.tenant = props.tenant;
  }

  private static nextId(): string {
    return randomUUID();
  }

  public static create(props: StayCreateProps): Stay {
    if (props.check_in >= props.check_out) {
      throw new ValidationError("Check-in date must be before check-out date");
    }

    if (props.guests < 1 || !Number.isInteger(props.guests)) {
      throw new ValidationError("Guests must be an integer greater than zero");
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
      checkIn: this.check_in,
      checkOut: this.check_out,
      tenantId: this.tenant_id,
      guests: this.guests,
      password: this.password,
      tenant: this.tenant,
    };
  }
}
