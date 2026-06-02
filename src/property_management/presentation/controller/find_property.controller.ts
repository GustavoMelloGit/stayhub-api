import z from "zod";
import type { User } from "../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import type { FindPropertyUseCase } from "../../application/use_case/find_property";

const inputSchema = z.object({
  property_id: z.uuid(),
});

type Input = z.infer<typeof inputSchema>;

export class FindPropertyController implements Controller {
  path = "/property/:property_id";
  method = HttpControllerMethod.GET;
  inputSchema = inputSchema;

  constructor(private readonly useCase: FindPropertyUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const input = request.body as Input;

    const output = await this.useCase.execute({
      property_id: input.property_id,
      user_id: user.id,
    });

    return output;
  }
}
