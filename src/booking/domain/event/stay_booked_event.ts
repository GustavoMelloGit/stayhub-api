import type { DomainEvent } from "../../../core/domain/event/domain_event";

export class StayBookedEvent implements DomainEvent {
  static readonly NAME = "stay_booked";
  public readonly name: string;
  public readonly occurred_at: Date;

  constructor(
    public readonly stay_id: string,
    public readonly property_id: string,
    public readonly paid_amount: number,
    public readonly entrance_code: string,
    public readonly check_in: Date,
    public readonly check_out: Date
  ) {
    this.name = StayBookedEvent.NAME;
    this.occurred_at = new Date();
  }
}
