import { randomUUID } from "node:crypto";
import type { BaseEntity } from "./base_entity";

type CreateCalendarProps = {
  name: string;
  user_id: string;
};

type CalendarProps = CreateCalendarProps & BaseEntity;

export class Calendar implements BaseEntity {
  readonly id: string;
  readonly name: string;
  readonly user_id: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at?: Date | null;

  private constructor(props: CalendarProps) {
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

  public static create(props: CreateCalendarProps): Calendar {
    return new Calendar({
      ...props,
      id: this.nextId(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  public static reconstitute(props: CalendarProps): Calendar {
    return new Calendar(props);
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
