import type { UseCase } from "../../../core/application/use_case/use_case";
import { LedgerEntry } from "../../domain/entity/ledger_entry";
import type { LedgerEntryRepository } from "../../domain/repository/ledger_entry_repository";

type Input = {
  amount: number;
  description: string | null;
  category: string;
  property_id: string;
};

type Output = void;

export class RecordExpenseUseCase implements UseCase<Input, Output> {
  constructor(private readonly ledgerEntryRepository: LedgerEntryRepository) {}

  async execute(input: Input): Promise<Output> {
    const negativeAmount = input.amount * -1;

    const ledgerEntry = LedgerEntry.newExpense({
      ...input,
      amount: negativeAmount,
    });

    await this.ledgerEntryRepository.save(ledgerEntry);
  }
}
