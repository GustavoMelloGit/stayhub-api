import type { BaseEntity } from "./base_entity";

export type ExternalBookingSourcePlatformName = "AIRBNB" | "BOOKING";

export type CreateExternalBookingSource = {
  property_id: string;
  platform_name: ExternalBookingSourcePlatformName;
  sync_url: string;
};

export type ExternalBookingSourceProps = BaseEntity &
  CreateExternalBookingSource;

export class ExternalBookingSource {
  readonly id: string;
  readonly property_id: string;
  readonly platform_name: ExternalBookingSourcePlatformName;
  readonly sync_url: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly deleted_at?: Date | null;

  private constructor(props: ExternalBookingSourceProps) {
    this.id = props.id;
    this.property_id = props.property_id;
    this.platform_name = props.platform_name;
    this.sync_url = props.sync_url;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
    this.deleted_at = props.deleted_at;
  }

  static #nextId(): string {
    return crypto.randomUUID();
  }

  public static create(
    props: CreateExternalBookingSource,
  ): ExternalBookingSource {
    return new ExternalBookingSource({
      ...props,
      id: this.#nextId(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });
  }

  public static reconstitute(
    props: ExternalBookingSourceProps,
  ): ExternalBookingSource {
    return new ExternalBookingSource(props);
  }

  public get data() {
    return {
      id: this.id,
      property_id: this.property_id,
      platform_name: this.platform_name,
      sync_url: this.sync_url,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }
}
