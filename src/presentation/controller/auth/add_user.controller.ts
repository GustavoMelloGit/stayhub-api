import z from "zod";
import { ValidationError } from "../../../application/error/validation_error";
import type { AddUserUseCase } from "../../../application/use_case/auth/add_user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";

const inputSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
});

type Input = z.infer<typeof inputSchema>;

export class AddUserController implements Controller {
  path = "/auth/users";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: AddUserUseCase) {}

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

    return {
      message: "User created successfully",
      data: output,
    };
  }
}
