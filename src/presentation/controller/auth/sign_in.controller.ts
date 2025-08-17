import z from "zod";
import { ValidationError } from "../../../application/error/validation_error";
import type { SignInUseCase } from "../../../application/use_case/auth/sign_in";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";

const inputSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type Input = z.infer<typeof inputSchema>;

export class SignInController implements Controller {
  path = "/auth/sign-in";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: SignInUseCase) {}

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
