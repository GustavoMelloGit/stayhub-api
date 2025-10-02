import type { StayPaymentConfirmedEvent } from "../../../booking/domain/event/stay_payment_confirmed_event";
import type { EventHandler } from "../../../core/application/event/event_handler";

export class RecordRevenueOnStayPaymentConfirmed
  implements EventHandler<StayPaymentConfirmedEvent>
{
  async handle(event: StayPaymentConfirmedEvent): Promise<void> {
    console.log(event);
  }
}
