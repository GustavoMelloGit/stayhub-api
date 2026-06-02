import z from "zod";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import type { RecordExpenseUseCase } from "../../application/use_case/record_expense";

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

export class RecordExpenseController implements Controller {
  path = "/finance/:property_id/expense";
  method = HttpControllerMethod.POST;
  inputSchema = inputSchema;

  constructor(private readonly useCase: RecordExpenseUseCase) {}

  async handle(request: ControllerRequest): Promise<void> {
    await this.useCase.execute(request.body as Input);
  }
}
