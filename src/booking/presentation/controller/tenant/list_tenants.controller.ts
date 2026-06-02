import z from "zod";
import { ListTenantsUseCase } from "../../../application/use_case/tenant/list_tenents";
import {
  HttpControllerMethod,
  type Controller,
} from "../../../../core/presentation/controller/controller";
import type { OpenApiOperation } from "../../../../core/presentation/open_api/open_api_types";
import {
  errorResponse,
  responseFromZod,
} from "../../../../core/infra/http/swagger/schema_helpers";

const outputSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    phone: z.string(),
  })
);

export class ListTenantsController implements Controller {
  path = "/tenants";
  method = HttpControllerMethod.GET;

  openApiSpec: OpenApiOperation = {
    summary: "List tenants",
    description: "Returns all tenants registered in the system.",
    tags: ["Tenants"],
    responses: {
      "200": responseFromZod("List of tenants", outputSchema),
      "401": errorResponse("Unauthorized"),
    },
  };

  constructor(private readonly useCase: ListTenantsUseCase) {}

  async handle() {
    const tenants = await this.useCase.execute();
    return tenants;
  }
}
