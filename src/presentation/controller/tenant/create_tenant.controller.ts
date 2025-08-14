import { z } from "zod";
import { ValidationError } from "../../../application/error/validation_error";
import { CreateTenantUseCase } from "../../../application/use_case/tenant/create_tenant";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().length(13),
});

type Input = z.infer<typeof schema>;

export class CreateTenantController implements Controller {
  path = "/tenants";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: CreateTenantUseCase) {}

  #validate(request: ControllerRequest): Input {
    const data = request.body;

    const parsedInput = schema.safeParse(data);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute(validationResponse);

    return {
      message: "Tenant created successfully",
      data: output,
    };
  }
}
