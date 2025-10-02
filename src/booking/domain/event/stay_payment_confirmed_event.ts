import type { DomainEvent } from "../../../core/domain/event/domain_event";

export class StayPaymentConfirmedEvent implements DomainEvent {
  public readonly name: string;
  public readonly occurred_at: Date;

  constructor(
    public readonly stay_id: string,
    public readonly property_id: string,
    public readonly paid_amount: number,
  ) {
    this.name = "stay_payment_confirmed";
    this.occurred_at = new Date();
  }
}
