import { z } from "zod";
import { ValidationError } from "../../../../core/application/error/validation_error";
import { UpdateStayUseCase } from "../../../application/use_case/stay/update_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../../auth/domain/entity/user";

const inputSchema = z.object({
  stay_id: z.uuid(),
  check_in: z.coerce.date().optional(),
  check_out: z.coerce.date().optional(),
  guests: z.int().positive().optional(),
  price: z.int().positive().optional(),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Controller para atualizar uma stay existente
 */
export class UpdateStayController implements Controller {
  path = "/booking/stay/:stay_id";
  method = HttpControllerMethod.PATCH;

  constructor(private readonly useCase: UpdateStayUseCase) {}

  #validate(request: ControllerRequest): Input {
    const parsedInput = inputSchema.safeParse({
      ...request.params,
      ...request.body,
    });

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
