import { randomUUID } from "node:crypto";
import { ConflictError } from "../../application/error/conflict_error";
import { ValidationError } from "../../application/error/validation_error";
import type { BaseEntity } from "./base_entity";
import { Stay } from "./stay";
import type { User } from "./user";

type CreatePropertyProps = {
  name: string;
  user_id: string;
};

type PropertyProps = CreatePropertyProps &
  BaseEntity & {
    user?: User;
    stays: Stay[];
  };

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
  readonly user?: User;
  readonly stays: Stay[];

  private constructor(props: PropertyProps) {
    this.id = props.id;
    this.name = props.name;
    this.user_id = props.user_id;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
    this.stays = props.stays;
  }

  private static nextId(): string {
    return randomUUID();
  }

  public static create(props: CreatePropertyProps): Property {
    return new Property({
      ...props,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
      stays: [],
    });
  }

  public static reconstitute(props: PropertyProps): Property {
    return new Property(props);
  }

  public bookStay(args: BookStayArgs): Stay {
    const { check_in, check_out, guests } = args;

    const isOccupied = this.stays?.some((s) => {
      return s.check_in <= check_out && s.check_out >= check_in;
    });

    if (isOccupied) {
      throw new ConflictError("Property is occupied");
    }

    if (check_in >= check_out) {
      throw new ValidationError("Check-in date must be before check-out date");
    }

    const isDateInThePast = check_in < new Date();

    if (isDateInThePast) {
      throw new ValidationError("Check-in date must be in the future");
    }

    const invalidNumberOfGuests = guests < 1 || !Number.isInteger(guests);

    if (invalidNumberOfGuests) {
      throw new ValidationError("Invalid guests");
    }

    const stay = Stay.create({
      ...args,
      property_id: this.id,
    });

    this.stays.push(stay);

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
  password: string;
};
