import { StayPaymentConfirmedEvent } from "../../../booking/domain/event/stay_payment_confirmed_event";
import type { EventDispatcher } from "../../../core/application/event/event_dispatcher";
import type { Logger } from "../../../core/application/logger/logger";
import { inMemoryEventDispatcher } from "../../../core/infra/event/in_memory_event_dispatcher";
import { ConsoleLogger } from "../../../core/infra/logger/console_logger";
import { RecordRevenueOnStayPaymentConfirmed } from "../../application/handler/record_revenue_on_stay_payment_confirmed";
import { RecordExpenseUseCase } from "../../application/use_case/record_expense";
import type { LedgerEntryRepository } from "../../domain/repository/ledger_entry_repository";
import { RecordExpenseController } from "../../presentation/controller/record_expense.controller";
import { LedgerEntryPostgresRepository } from "../database/postgres_repository/ledger_entry_postgres_repository";

export class FinanceDi {
  #logger: Logger;
  #eventDispatcher: EventDispatcher;
  #ledgerEntryRepository: LedgerEntryRepository;

  constructor() {
    this.#logger = new ConsoleLogger();
    this.#eventDispatcher = inMemoryEventDispatcher;
    this.#eventDispatcher.register(
      StayPaymentConfirmedEvent.NAME,
      this.makeRecordRevenueOnStayPaymentConfirmedHandler()
    );
    this.#ledgerEntryRepository = new LedgerEntryPostgresRepository();
  }

  // Handlers
  makeRecordRevenueOnStayPaymentConfirmedHandler() {
    return new RecordRevenueOnStayPaymentConfirmed(
      this.#logger,
      this.#ledgerEntryRepository
    );
  }

  // Use Cases
  makeRecordExpenseUseCase() {
    return new RecordExpenseUseCase(this.#ledgerEntryRepository);
  }

  // Controllers
  makeRecordExpenseController() {
    return new RecordExpenseController(this.makeRecordExpenseUseCase());
  }
}
