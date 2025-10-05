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

export class RecordRevenueUseCase implements UseCase<Input, Output> {
  constructor(private readonly ledgerEntryRepository: LedgerEntryRepository) {}

  async execute(input: Input): Promise<Output> {
    const ledgerEntry = LedgerEntry.newRevenue(input);
    await this.ledgerEntryRepository.save(ledgerEntry);
  }
}
