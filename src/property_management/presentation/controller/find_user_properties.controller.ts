import type { User } from "../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import type { FindUserPropertiesUseCase } from "../../application/use_case/find_user_properties";

export class FindUserPropertiesController implements Controller {
  path = "/property/user/all";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: FindUserPropertiesUseCase) {}

  async handle(_request: ControllerRequest, user: User) {
    const output = await this.useCase.execute({ user_id: user.id });
    return output;
  }
}
