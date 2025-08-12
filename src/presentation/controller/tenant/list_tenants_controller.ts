import { ListTenantsUseCase } from '../../../application/use_case/tenant/list_tenents';
import type { Controller, ControllerRequest } from '../controller';

export class ListTenantsController implements Controller {
  path = '/tenants';
  constructor(private readonly useCase: ListTenantsUseCase) {}

  async handle(request: ControllerRequest): Promise<Response> {
    const tenants = await this.useCase.execute();
    return Response.json(tenants);
  }
}
