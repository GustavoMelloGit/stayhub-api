import { z } from "zod";
import { ValidationError } from "../../../application/error/validation_error";
import { GetStayUseCase } from "../../../application/use_case/stay/get_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";

const inputSchema = z.object({
  stay_id: z.string(),
});

type Input = z.infer<typeof inputSchema>;

export class GetStayController implements Controller {
  path = "/stays/:stay_id";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: GetStayUseCase) {}

  validate(request: ControllerRequest): Input {
    const parsedInput = inputSchema.safeParse(request.params);

    if (!parsedInput.success) {
      throw new ValidationError(
        `Validation errors: ${JSON.stringify(parsedInput.error.flatten())}`,
      );
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest) {
    const validationResponse = this.validate(request);

    const output = await this.useCase.execute({
      stay_id: validationResponse.stay_id,
    });

    return output;
  }
}
