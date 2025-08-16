import { randomUUID } from "node:crypto";
import { ValidationError } from "../../application/error/validation_error";
import type { BaseEntity } from "./base_entity";
import type { Stay } from "./stay";
import type { User } from "./user";

type CreatePropertyProps = {
  name: string;
  user_id: string;
};

type PropertyProps = CreatePropertyProps &
  BaseEntity & {
    user?: User;
    stays?: Stay[];
  };

export class Property implements BaseEntity {
  readonly id: string;
  readonly name: string;
  readonly user_id: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at?: Date | null;
  readonly user?: User;
  readonly stays?: Stay[];

  private constructor(props: PropertyProps) {
    this.id = props.id;
    this.name = props.name;
    this.user_id = props.user_id;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
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
    });
  }

  public static reconstitute(props: PropertyProps): Property {
    return new Property(props);
  }

  public bookStay(stay: Stay) {
    if (this.stays?.some((s) => s.id === stay.id)) {
      throw new ValidationError("Stay already booked");
    }

    if (stay.check_in >= stay.check_out) {
      throw new ValidationError("Check-in date must be before check-out date");
    }

    if (stay.guests < 1 || !Number.isInteger(stay.guests)) {
      throw new ValidationError("Guests must be an integer greater than zero");
    }

    this.stays?.push(stay);
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
