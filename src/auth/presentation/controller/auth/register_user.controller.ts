import z from "zod";
import { ValidationError } from "../../../../core/application/error/validation_error";
import type { RegisterUserUseCase } from "../../../../auth/application/use_case/register_user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";

const inputSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
});

type Input = z.infer<typeof inputSchema>;

export class RegisterUserController implements Controller {
  path = "/auth/users";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: RegisterUserUseCase) {}

  #validate(request: ControllerRequest): Input {
    const parsedInput = inputSchema.safeParse(request.body);

    if (!parsedInput.success) {
      throw new ValidationError(parsedInput.error.message);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute(validationResponse);

    return output;
  }
}
