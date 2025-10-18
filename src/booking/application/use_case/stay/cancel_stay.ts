import { ResourceNotFoundError } from "../../../../core/application/error/resource_not_found_error";
import type { UseCase } from "../../../../core/application/use_case/use_case";
import type { User } from "../../../../auth/domain/entity/user";
import type { StayRepository } from "../../../domain/repository/stay_repository";
import type { PropertyRepository } from "../../../../property_management/domain/repository/property_repository";

type Input = {
  stay_id: string;
};

type Output = {
  id: string;
  cancelled_at: Date;
};

export class CancelStayUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly stayRepository: StayRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(input: Input, user: User): Promise<Output> {
    const stay = await this.stayRepository.stayOfId(input.stay_id);

    if (!stay) {
      throw new ResourceNotFoundError("Stay");
    }

    // Verificar se o usuário é o proprietário da propriedade
    const property = await this.propertyRepository.propertyOfId(
      stay.property_id
    );
    if (!property) {
      throw new ResourceNotFoundError("Property");
    }

    if (property.user_id !== user.id) {
      throw new ResourceNotFoundError("Stay");
    }

    stay.cancel();
    await this.stayRepository.saveStay(stay);

    return {
      id: stay.id,
      cancelled_at: stay.deleted_at!,
    };
  }
}
