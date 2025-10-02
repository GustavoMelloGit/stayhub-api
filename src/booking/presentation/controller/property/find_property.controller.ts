import z from "zod";
import type { FindPropertyUseCase } from "../../../application/use_case/property/find_property";
import type { User } from "../../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import { ValidationError } from "../../../../core/application/error/validation_error";

const inputSchema = z.object({
  property_id: z.uuid(),
});

type Input = z.infer<typeof inputSchema>;

export class FindPropertyController implements Controller {
  path = "/property/:property_id";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: FindPropertyUseCase) {}

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
      property_id: validationResponse.property_id,
      user_id: user.id,
    });
    return output;
  }
}
