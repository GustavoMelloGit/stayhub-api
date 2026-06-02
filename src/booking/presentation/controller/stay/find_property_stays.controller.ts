import z from "zod";
import type { FindPropertyStaysUseCase } from "../../../application/use_case/stay/find_property_stays";
import type { User } from "../../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../../core/application/dto/pagination";

const inputSchema = z
  .object({
    property_id: z.uuid(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(MAX_LIMIT)
      .default(DEFAULT_LIMIT),
  })
  .refine(data => !data.from || !data.to || data.from <= data.to, {
    message: "'from' must be less than or equal to 'to'",
    path: ["from"],
  });

type Input = z.infer<typeof inputSchema>;

export class FindPropertyStaysController implements Controller {
  path = "/booking/property/:property_id/stays";
  method = HttpControllerMethod.GET;
  inputSchema = inputSchema;

  constructor(private readonly useCase: FindPropertyStaysUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const input = request.body as Input;

    const output = await this.useCase.execute({
      property_id: input.property_id,
      user_id: user.id,
      pagination: { page: input.page, limit: input.limit },
      filters: { from: input.from, to: input.to },
    });

    return output;
  }
}
