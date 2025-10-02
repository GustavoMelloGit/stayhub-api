import type { ReconcileExternalBookingsUseCase } from "../../../application/use_case/property/reconcile_external_bookings";
import type { User } from "../../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";

export class ReconcileExternalBookingController implements Controller {
  path = "/property/reconcile-external-booking";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: ReconcileExternalBookingsUseCase) {}

  async handle(_req: ControllerRequest, user: User) {
    const output = await this.useCase.execute({ user });
    return output;
  }
}
