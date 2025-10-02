import { z } from "zod";
import { ValidationError } from "../../../../core/application/error/validation_error";
import { GetStayUseCase } from "../../../application/use_case/stay/get_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../../auth/domain/entity/user";

const inputSchema = z.object({
  stay_id: z.uuid(),
});

type Input = z.infer<typeof inputSchema>;

export class GetStayController implements Controller {
  path = "/stay/:stay_id";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: GetStayUseCase) {}

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
