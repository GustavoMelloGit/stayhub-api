import z from "zod";
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
  inputSchema = inputSchema;

  constructor(private readonly useCase: RegisterUserUseCase) {}

  async handle(request: ControllerRequest) {
    const output = await this.useCase.execute(request.body as Input);
    return output;
  }
}
