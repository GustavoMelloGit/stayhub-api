import { z } from "zod";
import { ValidationError } from "../../../application/error/validation_error";
import { CreateStayUseCase } from "../../../application/use_case/stay/create_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";

const inputSchema = z.object({
  guests: z.number().gt(0),
  tenant_id: z.uuid(),
  password: z.string(),
  check_in: z.coerce.date(),
  check_out: z.coerce.date(),
});

type CreateStayInput = z.infer<typeof inputSchema>;

export class CreateStayController implements Controller {
  path = "/stays";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: CreateStayUseCase) {}

  validate(request: ControllerRequest): CreateStayInput {
    const parsedInput = inputSchema.safeParse(request.body);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest) {
    const validationResponse = this.validate(request);

    const output = await this.useCase.execute(validationResponse);
    return output;
  }
}
