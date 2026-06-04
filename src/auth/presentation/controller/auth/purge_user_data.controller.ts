import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../domain/entity/user";
import type { OpenApiOperation } from "../../../../core/presentation/open_api/open_api_types";
import { PurgeUserDataUseCase } from "../../../application/use_case/purge_user_data";
import { errorResponse } from "../../../../core/infra/http/swagger/schema_helpers";

export class PurgeUserDataController implements Controller {
  path = "/auth/me";
  method = HttpControllerMethod.DELETE;

  openApiSpec: OpenApiOperation = {
    summary: "Delete account",
    description:
      "Permanently deletes the authenticated user's account and all associated personal data (LGPD Art. 17).",
    tags: ["Auth"],
    responses: {
      "204": { description: "Account deleted successfully" },
      "401": errorResponse("Unauthorized"),
    },
  };

  constructor(private readonly useCase: PurgeUserDataUseCase) {}

  async handle(_request: ControllerRequest, user: User): Promise<undefined> {
    await this.useCase.execute(undefined, user);
    return undefined;
  }
}
