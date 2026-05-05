import z from "zod";
import type { FindPropertyStaysUseCase } from "../../../application/use_case/stay/find_property_stays";
import type { User } from "../../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import { ValidationError } from "../../../../core/application/error/validation_error";
import { paginationInputSchema } from "../../../../core/application/dto/pagination";

const inputSchema = z
  .object({
    property_id: z.uuid(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    pagination: paginationInputSchema,
  })
  .refine(data => !data.from || !data.to || data.from <= data.to, {
    message: "'from' must be less than or equal to 'to'",
    path: ["from"],
  });

type Input = z.infer<typeof inputSchema>;

export class FindPropertyStaysController implements Controller {
  path = "/booking/property/:property_id/stays";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: FindPropertyStaysUseCase) {}

  #validate(request: ControllerRequest): Input {
    const { property_id } = request.params;
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    const data: Record<string, unknown> = {
      property_id,
      from: from ?? undefined,
      to: to ?? undefined,
      pagination: {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      },
    };

    const parsedInput = inputSchema.safeParse(data);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest, user: User) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute({
      property_id: validationResponse.property_id,
      user_id: user.id,
      pagination: validationResponse.pagination,
      filters: {
        from: validationResponse.from,
        to: validationResponse.to,
      },
    });

    return output;
  }
}
