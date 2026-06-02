import { z } from "zod";
import { UpdateStayUseCase } from "../../../application/use_case/stay/update_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../../auth/domain/entity/user";

const inputSchema = z.object({
  stay_id: z.uuid(),
  check_in: z.coerce.date().optional(),
  check_out: z.coerce.date().optional(),
  guests: z.int().positive().optional(),
  price: z.int().positive().optional(),
});

type Input = z.infer<typeof inputSchema>;

export class UpdateStayController implements Controller {
  path = "/booking/stay/:stay_id";
  method = HttpControllerMethod.PATCH;
  inputSchema = inputSchema;

  constructor(private readonly useCase: UpdateStayUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const output = await this.useCase.execute(request.body as Input, user);
    return output;
  }
}
