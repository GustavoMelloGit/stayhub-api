import { z } from "zod";
import { CancelStayUseCase } from "../../../application/use_case/stay/cancel_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../../auth/domain/entity/user";

const inputSchema = z.object({
  stay_id: z.uuidv4(),
});

type Input = z.infer<typeof inputSchema>;

export class CancelStayController implements Controller {
  path = "/booking/stay/:stay_id";
  method = HttpControllerMethod.DELETE;
  inputSchema = inputSchema;

  constructor(private readonly useCase: CancelStayUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const output = await this.useCase.execute(request.body as Input, user);
    return output;
  }
}
