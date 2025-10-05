import type { StayPaymentConfirmedEvent } from "../../../booking/domain/event/stay_payment_confirmed_event";
import type { EventHandler } from "../../../core/application/event/event_handler";
import type { Logger } from "../../../core/application/logger/logger";
import { LedgerEntry } from "../../domain/entity/ledger_entry";
import type { LedgerEntryRepository } from "../../domain/repository/ledger_entry_repository";

export class RecordRevenueOnStayPaymentConfirmed
  implements EventHandler<StayPaymentConfirmedEvent>
{
  constructor(
    private readonly logger: Logger,
    private readonly ledgerEntryRepository: LedgerEntryRepository,
  ) {}

  async handle(event: StayPaymentConfirmedEvent): Promise<void> {
    this.logger.info("Stay payment confirmed - recording revenue", {
      event: event,
      stayId: event.stay_id,
      amount: event.paid_amount,
    });

    const ledgerEntry = LedgerEntry.create({
      amount: event.paid_amount,
      description: "Stay payment",
      category: "stay",
      property_id: event.property_id,
    });

    await this.ledgerEntryRepository.save(ledgerEntry);
  }
}
