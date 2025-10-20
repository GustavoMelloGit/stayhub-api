import { ResourceNotFoundError } from "../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../core/application/use_case/use_case";
import type { PropertyRepository } from "../../../property_management/domain/repository/property_repository";
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
  constructor(
    private readonly ledgerEntryRepository: LedgerEntryRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const property = await this.propertyRepository.propertyOfId(
      input.property_id
    );
    if (!property) {
      throw new ResourceNotFoundError("Property");
    }

    const ledgerEntry = LedgerEntry.newRevenue(input);
    await this.ledgerEntryRepository.save(ledgerEntry);
  }
}
