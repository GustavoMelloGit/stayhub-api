import z from "zod";
import type { FindPropertyStaysUseCase } from "../../../application/use_case/stay/find_property_stays";
import type { User } from "../../../domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../controller";
import { ValidationError } from "../../../application/error/validation_error";

const inputSchema = z.object({
  property_id: z.uuid(),
  onlyIncomingStays: z.boolean().optional(),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Controller para buscar todas as estadias de uma propriedade específica
 */
export class FindPropertyStaysController implements Controller {
  path = "/property/:property_id/stays";
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: FindPropertyStaysUseCase) {}

  #validate(request: ControllerRequest): Input {
    const { property_id } = request.params;
    const url = new URL(request.url);
    const onlyIncomingStays = url.searchParams.get("onlyIncomingStays");

    const data: Record<string, unknown> = {
      property_id,
      onlyIncomingStays: onlyIncomingStays === "true",
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
      onlyIncomingStays: validationResponse.onlyIncomingStays,
    });

    return output;
  }
}
