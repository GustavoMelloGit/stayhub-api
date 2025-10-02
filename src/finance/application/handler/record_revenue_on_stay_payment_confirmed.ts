import type { StayPaymentConfirmedEvent } from "../../../booking/domain/event/stay_payment_confirmed_event";
import type { EventHandler } from "../../../core/application/event/event_handler";
import type { Logger } from "../../../core/application/logger/logger";

export class RecordRevenueOnStayPaymentConfirmed
  implements EventHandler<StayPaymentConfirmedEvent>
{
  constructor(private readonly logger: Logger) {}

  async handle(event: StayPaymentConfirmedEvent): Promise<void> {
    this.logger.info("Stay payment confirmed - recording revenue", {
      event: event,
      stayId: event.stay_id,
      amount: event.paid_amount,
    });
  }
}
