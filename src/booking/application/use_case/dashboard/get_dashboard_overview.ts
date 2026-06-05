import type { UseCase } from "../../../../core/application/use_case/use_case";
import type { PropertyRepository } from "../../../../property_management/domain/repository/property_repository";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { LedgerEntryRepository } from "../../../../finance/domain/repository/ledger_entry_repository";

export class GetDashboardOverviewUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly stayRepository: StayRepository,
    private readonly ledgerEntryRepository: LedgerEntryRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const now = input.date ?? new Date();
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const properties = await this.propertyRepository.allFromUser(input.user_id);
    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
      return {
        kpis: { active_stays: 0, upcoming_check_ins: 0, monthly_revenue: 0 },
        upcoming_stays: [],
      };
    }

    const [stats, monthly_revenue] = await Promise.all([
      this.stayRepository.dashboardStats(propertyIds, date),
      this.ledgerEntryRepository.monthlyRevenueForProperties(propertyIds, date),
    ]);

    return {
      kpis: {
        active_stays: stats.active_stays,
        upcoming_check_ins: stats.upcoming_check_ins,
        monthly_revenue,
      },
      upcoming_stays: stats.upcoming_stays,
    };
  }
}

type Input = {
  user_id: string;
  date?: Date;
};

type Output = {
  kpis: {
    active_stays: number;
    upcoming_check_ins: number;
    monthly_revenue: number;
  };
  upcoming_stays: Array<{
    id: string;
    property_id: string;
    property_name: string;
    check_in: Date;
    tenant: { name: string };
  }>;
};
