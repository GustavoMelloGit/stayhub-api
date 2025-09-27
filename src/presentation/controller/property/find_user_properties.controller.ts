import type { FindUserPropertiesUseCase } from "../../../application/use_case/property/find_user_properties";
import type { User } from "../../../domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";

export class FindUserPropertiesController implements Controller {
  path = "/property/user/all";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: FindUserPropertiesUseCase) {}

  async handle(_request: ControllerRequest, user: User) {
    const output = await this.useCase.execute({ user_id: user.id });
    return output;
  }
}
