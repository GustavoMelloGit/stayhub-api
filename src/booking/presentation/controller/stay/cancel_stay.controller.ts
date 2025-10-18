import { z } from "zod";
import { ValidationError } from "../../../../core/application/error/validation_error";
import { CancelStayUseCase } from "../../../application/use_case/stay/cancel_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../../auth/domain/entity/user";

const inputSchema = z.object({
  stay_id: z.uuidv4(),
});

type Input = z.infer<typeof inputSchema>;

export class CancelStayController implements Controller {
  path = "/booking/stay/:stay_id";
  method = HttpControllerMethod.DELETE;

  constructor(private readonly useCase: CancelStayUseCase) {}

  #validate(request: ControllerRequest): Input {
    const parsedInput = inputSchema.safeParse(request.params);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest, user: User) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute(validationResponse, user);

    return output;
  }
}
