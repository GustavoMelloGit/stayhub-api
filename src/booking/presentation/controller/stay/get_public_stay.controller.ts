import z from "zod";
import type { GetPublicStayUseCase } from "../../../application/use_case/stay/get_public_stay";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";

const inputSchema = z.object({
  stay_id: z.uuid(),
});

type Input = z.infer<typeof inputSchema>;

export class GetPublicStayController implements Controller {
  path = "/public/booking/stay/:stay_id";
  method = HttpControllerMethod.GET;
  inputSchema = inputSchema;

  constructor(private readonly useCase: GetPublicStayUseCase) {}

  async handle(request: ControllerRequest) {
    const output = await this.useCase.execute(request.body as Input);
    return output;
  }
}
