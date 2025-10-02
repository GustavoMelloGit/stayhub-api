import z from "zod";
import type { CreateExternalBookingSourceUseCase } from "../../../application/use_case/property/create_external_booking_source";
import type { User } from "../../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import { ValidationError } from "../../../../core/application/error/validation_error";

const inputSchema = z.object({
  platform_name: z.enum(["AIRBNB", "BOOKING"]),
  sync_url: z.url(),
  property_id: z.string(),
});

type Input = z.infer<typeof inputSchema>;

export class CreateExternalBookingSourceController implements Controller {
  path = "/property/:property_id/external-booking";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: CreateExternalBookingSourceUseCase) {}

  #validate(request: ControllerRequest): Input {
    const { property_id } = request.params;
    const data: Record<string, unknown> = request.body;
    data.property_id = property_id;

    const parsedInput = inputSchema.safeParse(data);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest, user: User) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute({
      platform_name: validationResponse.platform_name,
      sync_url: validationResponse.sync_url,
      property_id: validationResponse.property_id,
      user_id: user.id,
    });

    return output;
  }
}
