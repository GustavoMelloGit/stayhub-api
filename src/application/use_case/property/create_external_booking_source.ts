import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { ResourceNotFoundError } from "../../error/resource_not_found_error";
import { type ExternalBookingSourcesRepository } from "../../../domain/repository/external_booking_source_repository";
import type { UseCase } from "../use_case";
import { ExternalBookingSource } from "../../../domain/entity/external_booking_source";

type Input = {
  property_id: string;
  platform_name: "AIRBNB" | "BOOKING";
  sync_url: string;
  user_id: string;
};

type Output = {
  id: string;
  property_id: string;
  platform_name: "AIRBNB" | "BOOKING";
  sync_url: string;
};

export class CreateExternalBookingSourceUseCase
  implements UseCase<Input, Output>
{
  constructor(
    private readonly externalBookingSourceRepository: ExternalBookingSourcesRepository,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const { property_id, platform_name, sync_url, user_id } = input;

    const property = await this.propertyRepository.propertyOfId(property_id);
    if (!property) {
      throw new ResourceNotFoundError("Property");
    }

    if (property.user_id !== user_id) {
      throw new ResourceNotFoundError("Property");
    }

    const bookingSource = ExternalBookingSource.create({
      property_id: property_id,
      platform_name: platform_name,
      sync_url: sync_url,
    });

    await this.externalBookingSourceRepository.save(bookingSource);

    return {
      id: bookingSource.id,
      platform_name: bookingSource.platform_name,
      property_id: bookingSource.property_id,
      sync_url: bookingSource.sync_url,
    };
  }
}
