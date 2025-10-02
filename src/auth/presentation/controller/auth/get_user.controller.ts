import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../domain/entity/user";

type Output = {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
};

export class GetUserController implements Controller {
  path = "/auth/me";
  method = HttpControllerMethod.GET;

  constructor() {}

  async handle(_request: ControllerRequest, user: User): Promise<Output> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
