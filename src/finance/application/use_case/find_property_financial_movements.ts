import type { UseCase } from "../../../core/application/use_case/use_case";
import type { LedgerEntryRepository } from "../../domain/repository/ledger_entry_repository";
import type {
  PaginatedResult,
  PaginationInput,
} from "../../../core/application/dto/pagination";

type Input = {
  propertyId: string;
  pagination: PaginationInput;
};

type Output = PaginatedResult<{
  id: string;
  amount: number;
  description: string | null;
  category: string;
  property_id: string;
  created_at: Date;
  updated_at: Date;
}>;

/**
 * Use case para buscar movimentações financeiras de uma propriedade específica
 */
export class FindPropertyFinancialMovementsUseCase
  implements UseCase<Input, Output>
{
  constructor(private readonly ledgerEntryRepository: LedgerEntryRepository) {}

  async execute(input: Input): Promise<Output> {
    const movements = await this.ledgerEntryRepository.findByPropertyId(
      input.propertyId,
      input.pagination
    );

    return {
      pagination: movements.pagination,
      data: movements.data.map(movement => ({
        id: movement.id,
        amount: movement.amount,
        description: movement.description,
        category: movement.category,
        property_id: movement.property_id,
        created_at: movement.created_at,
        updated_at: movement.updated_at,
      })),
    };
  }
}
