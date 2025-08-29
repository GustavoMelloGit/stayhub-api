import { z } from "zod";
import { ValidationError } from "../../../application/error/validation_error";
import { BookStayUseCase } from "../../../application/use_case/property/book_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";
import type { User } from "../../../domain/entity/user";

const inputSchema = z.object({
  guests: z.number().gt(0),
  tenant_id: z.uuid(),
  property_id: z.uuid(),
  password: z.string(),
  check_in: z.coerce.date(),
  check_out: z.coerce.date(),
});

type Input = z.infer<typeof inputSchema>;

export class BookStayController implements Controller {
  path = "/property/:property_id/book";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: BookStayUseCase) {}

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

  async handle(request: ControllerRequest, user: User) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute(validationResponse, user);

    return {
      message: "Stay created successfully",
      data: output,
    };
  }
}
