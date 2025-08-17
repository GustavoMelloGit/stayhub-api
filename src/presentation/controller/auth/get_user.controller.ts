import { UnauthorizedError } from "../../../application/error/unauthorized_error";
import type { GetUserUseCase } from "../../../application/use_case/auth/get_user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";

export class GetUserController implements Controller {
  path = "/auth/me";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: GetUserUseCase) {}

  async handle(request: ControllerRequest) {
    if (!request.token) {
      throw new UnauthorizedError("Unauthorized");
    }

    const output = await this.useCase.execute({ token: request.token });

    return output;
  }
}
