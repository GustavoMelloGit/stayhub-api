import z from "zod";
import type { GetPublicStayUseCase } from "../../../application/use_case/stay/get_public_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import { ValidationError } from "../../../../core/application/error/validation_error";

const inputSchema = z.object({
  stay_id: z.uuid(),
});

type Input = z.infer<typeof inputSchema>;

export class GetPublicStayController implements Controller {
  path = "/public/booking/stay/:stay_id";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: GetPublicStayUseCase) {}

  #validate(request: ControllerRequest): Input {
    const parsedInput = inputSchema.safeParse(request.params);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute(validationResponse);

    return output;
  }
}
