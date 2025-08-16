import { randomUUID } from "node:crypto";

type UserCreateProps = {
  name: string;
  email: string;
  password: string;
};

type UserProps = UserCreateProps & {
  id: string;
};

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
  }

  private static nextId(): string {
    return randomUUID();
  }

  public static create(props: UserCreateProps): User {
    return new User({ ...props, id: this.nextId() });
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
    };
  }
}
