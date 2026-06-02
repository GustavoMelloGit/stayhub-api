import z from "zod";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
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
  inputSchema = inputSchema;

  constructor(private readonly useCase: RecordRevenueUseCase) {}

  async handle(request: ControllerRequest): Promise<void> {
    await this.useCase.execute(request.body as Input);
  }
}
