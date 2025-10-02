import { ValidationError } from "../../../core/application/error/validation_error";
import type { BaseEntity } from "../../../core/domain/entity/base_entity";

export type Sex = "MALE" | "FEMALE" | "OTHER";

type TenantCreateProps = {
  name: string;
  phone: string;
  sex: Sex;
};

type TenantProps = TenantCreateProps & BaseEntity;

export type WithTenant<T> = T & {
  tenant: Tenant;
};

/**
 * @kind Entity, Aggregate Root
 */
export class Tenant {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly sex: Sex;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at?: Date | null;

  private constructor(props: TenantProps) {
    this.id = props.id;
    this.name = props.name;
    this.phone = props.phone;
    this.sex = props.sex;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(props: TenantCreateProps): Tenant {
    const validationErrors = [];

    if (props.name.trim().length < 3) {
      validationErrors.push({
        field: "name",
        message: "O nome deve ter pelo menos 3 caracteres.",
      });
    }

    const phoneRegex = /^[0-9]+$/;
    if (
      !phoneRegex.test(props.phone) ||
      props.phone.length < 10 ||
      props.phone.length > 15
    ) {
      validationErrors.push({
        field: "phone",
        message:
          "O telefone deve conter apenas números e ter entre 10 e 15 dígitos.",
      });
    }

    if (validationErrors.length > 0) {
      throw new ValidationError(JSON.stringify(validationErrors));
    }

    return new Tenant({
      ...props,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  public get data() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      sex: this.sex,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }
}
