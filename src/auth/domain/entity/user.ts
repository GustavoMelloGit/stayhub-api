import {
  baseEntitySchema,
  type WithoutBaseEntity,
} from "../../../core/domain/entity/base_entity";
import { z } from "zod";

export const userSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

type UserData = z.infer<typeof userSchema>;

export class User {
  private readonly data: UserData;

  private constructor(data: UserData) {
    this.data = userSchema.parse(data);
  }

  private static nextId(): string {
    return crypto.randomUUID();
  }

  public static create(data: WithoutBaseEntity<UserData>): User {
    return new User({
      ...data,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(data: UserData): User {
    return new User(data);
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get email() {
    return this.data.email;
  }

  get password() {
    return this.data.password;
  }

  get created_at() {
    return this.data.created_at;
  }

  get updated_at() {
    return this.data.updated_at;
  }

  get deleted_at() {
    return this.data.deleted_at;
  }
}
