import z from "zod";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import type { ListAppSettingsUseCase } from "../../application/use_case/list_app_settings";
import type { OpenApiOperation } from "../../../core/presentation/open_api/open_api_types";
import {
  errorResponse,
  responseFromZod,
} from "../../../core/infra/http/swagger/schema_helpers";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../core/application/dto/pagination";

const inputSchema = z
  .object({
    page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(MAX_LIMIT)
      .default(DEFAULT_LIMIT),
  })
  .strict();

const outputSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().uuid(),
      key: z.string(),
      value: z.unknown(),
      type: z.enum(["string", "number", "boolean", "json"]),
      description: z.string().nullable(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
    })
  ),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    total_pages: z.number().int(),
    has_next: z.boolean(),
    has_previous: z.boolean(),
  }),
});

type Input = z.infer<typeof inputSchema>;

export class ListAppSettingsController implements Controller {
  path = "/settings";
  method = HttpControllerMethod.GET;
  inputSchema = inputSchema;

  openApiSpec: OpenApiOperation = {
    summary: "List app settings",
    description:
      "Returns a paginated list of all application configuration entries.",
    tags: ["Settings"],
    parameters: [
      {
        name: "page",
        in: "query",
        required: false,
        schema: { type: "integer", default: DEFAULT_PAGE },
      },
      {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", default: DEFAULT_LIMIT },
      },
    ],
    responses: {
      "200": responseFromZod("Paginated app settings", outputSchema),
      "401": errorResponse("Unauthorized"),
    },
  };

  constructor(private readonly useCase: ListAppSettingsUseCase) {}

  async handle(request: ControllerRequest): Promise<unknown> {
    const input = request.body as Input;

    return this.useCase.execute({
      pagination: { page: input.page, limit: input.limit },
    });
  }
}
