import z from "zod";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import type { FindPropertyFinancialMovementsUseCase } from "../../application/use_case/find_property_financial_movements";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../core/application/dto/pagination";

const inputSchema = z.object({
  property_id: z.uuidv4("Property ID must be a valid UUID"),
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT),
});

type Input = z.infer<typeof inputSchema>;

export class FindPropertyFinancialMovementsController implements Controller {
  path = "/finance/properties/:property_id/movements";
  method = HttpControllerMethod.GET;
  inputSchema = inputSchema;

  constructor(
    private readonly useCase: FindPropertyFinancialMovementsUseCase
  ) {}

  async handle(request: ControllerRequest): Promise<unknown> {
    const input = request.body as Input;

    return this.useCase.execute({
      propertyId: input.property_id,
      pagination: { page: input.page, limit: input.limit },
    });
  }
}
