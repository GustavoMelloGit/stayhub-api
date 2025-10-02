import type { BaseEntity } from "../../../core/domain/entity/base_entity";

type UserCreateProps = {
  name: string;
  email: string;
  password: string;
};

type UserProps = UserCreateProps & BaseEntity;

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at?: Date | null;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(props: UserCreateProps): User {
    return new User({
      ...props,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  public get data() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }
}
