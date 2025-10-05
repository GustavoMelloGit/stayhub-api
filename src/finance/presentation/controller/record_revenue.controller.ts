import z from "zod";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import { ValidationError } from "../../../core/application/error/validation_error";
import type { RecordRevenueUseCase } from "../../application/use_case/record_revenue";

const inputSchema = z.object({
  amount: z.int(),
  description: z
    .string()
    .optional()
    .transform(val => val ?? null),
  category: z.string().min(1, "Category is required"),
  property_id: z.uuidv4("Property ID must be a valid UUID"),
});

type Input = z.infer<typeof inputSchema>;

export class RecordRevenueController implements Controller {
  path = "/finance/:property_id/revenue";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: RecordRevenueUseCase) {}

  #validate(request: ControllerRequest): Input {
    const { property_id } = request.params;
    const data: Record<string, unknown> = request.body;
    data.property_id = property_id;

    const parsedInput = inputSchema.safeParse(data);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest): Promise<void> {
    const validationResponse = this.#validate(request);

    await this.useCase.execute(validationResponse);
  }
}
