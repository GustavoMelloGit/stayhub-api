import z from "zod";
import type { CreateExternalBookingSourceUseCase } from "../../../application/use_case/property/create_external_booking_source";
import type { User } from "../../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";

const inputSchema = z.object({
  platform_name: z.enum(["AIRBNB", "BOOKING"]),
  sync_url: z.url(),
  property_id: z.string(),
});

type Input = z.infer<typeof inputSchema>;

export class CreateExternalBookingSourceController implements Controller {
  path = "/booking/property/:property_id/external-booking";
  method = HttpControllerMethod.POST;
  inputSchema = inputSchema;

  constructor(private readonly useCase: CreateExternalBookingSourceUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const input = request.body as Input;

    const output = await this.useCase.execute({
      platform_name: input.platform_name,
      sync_url: input.sync_url,
      property_id: input.property_id,
      user_id: user.id,
    });

    return output;
  }
}
