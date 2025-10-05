import z from "zod";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import { ValidationError } from "../../../core/application/error/validation_error";
import type { FindPropertyFinancialMovementsUseCase } from "../../application/use_case/find_property_financial_movements";

const inputSchema = z.object({
  property_id: z.uuidv4("Property ID must be a valid UUID"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

type Input = z.infer<typeof inputSchema>;

export class FindPropertyFinancialMovementsController implements Controller {
  path = "/finance/properties/:property_id/movements";
  method = HttpControllerMethod.GET;

  constructor(
    private readonly useCase: FindPropertyFinancialMovementsUseCase
  ) {}

  #validate(request: ControllerRequest): Input {
    const { property_id } = request.params;
    const queryParams = request.query as Record<string, unknown>;

    const data = {
      property_id,
      page: queryParams.page,
      limit: queryParams.limit,
    };

    const parsedInput = inputSchema.safeParse(data);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest): Promise<unknown> {
    const validationResponse = this.#validate(request);

    const result = await this.useCase.execute({
      propertyId: validationResponse.property_id,
      pagination: {
        page: validationResponse.page,
        limit: validationResponse.limit,
      },
    });

    return result;
  }
}
