import z from "zod";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import type { DeleteAppSettingUseCase } from "../../application/use_case/delete_app_setting";
import type { OpenApiOperation } from "../../../core/presentation/open_api/open_api_types";
import {
  errorResponse,
  noContentResponse,
} from "../../../core/infra/http/swagger/schema_helpers";

const inputSchema = z
  .object({
    id: z.uuidv4("ID must be a valid UUID"),
  })
  .strict();

type Input = z.infer<typeof inputSchema>;

export class DeleteAppSettingController implements Controller {
  path = "/settings/:id";
  method = HttpControllerMethod.DELETE;
  inputSchema = inputSchema;

  openApiSpec: OpenApiOperation = {
    summary: "Delete app setting",
    description: "Soft-deletes an application configuration entry.",
    tags: ["Settings"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    responses: {
      "204": noContentResponse("App setting deleted"),
      "401": errorResponse("Unauthorized"),
      "403": errorResponse("Forbidden — admin role required"),
      "404": errorResponse("App setting not found"),
    },
  };

  constructor(private readonly useCase: DeleteAppSettingUseCase) {}

  async handle(request: ControllerRequest): Promise<unknown> {
    const input = request.body as Input;

    await this.useCase.execute({ id: input.id });
    return undefined;
  }
}
