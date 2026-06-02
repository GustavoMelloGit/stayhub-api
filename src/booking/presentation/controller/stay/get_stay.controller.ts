import { z } from "zod";
import { GetStayUseCase } from "../../../application/use_case/stay/get_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { User } from "../../../../auth/domain/entity/user";

const inputSchema = z.object({
  stay_id: z.uuid(),
});

type Input = z.infer<typeof inputSchema>;

export class GetStayController implements Controller {
  path = "/booking/stay/:stay_id";
  method = HttpControllerMethod.GET;
  inputSchema = inputSchema;

  constructor(private readonly useCase: GetStayUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const output = await this.useCase.execute(request.body as Input, user);
    return output;
  }
}
