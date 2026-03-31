import type { StayBookedEvent } from "../../domain/event/stay_booked_event";
import type { EventHandler } from "../../../core/application/event/event_handler";
import type { Logger } from "../../../core/application/logger/logger";
import type { DeviceManagementService } from "../../domain/service/device_management";

export class CreateTempPasswordOnBook implements EventHandler<StayBookedEvent> {
  constructor(
    private readonly logger: Logger,
    private readonly deviceManagementService: DeviceManagementService
  ) {}

  async handle(event: StayBookedEvent): Promise<void> {
    this.logger.info("Creating temp password on book", {
      event: event,
      stayId: event.stay_id,
    });

    await this.deviceManagementService.setTempPassword(
      event.entrance_code,
      event.tenant_name,
      event.check_in,
      event.check_out
    );
  }
}
