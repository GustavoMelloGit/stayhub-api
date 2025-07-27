import { ListTenantsUseCase } from '../../../application/use_case/tenant/list_tenents';
import { BunControllerAdapter } from '../../../infra/adapters/controller_adapter';
import type { Controller } from '../controller';

export class ListTenantsController implements Controller {
  constructor(private readonly useCase: ListTenantsUseCase) {}

  @BunControllerAdapter
  async handle(): Promise<Response> {
    const tenants = await this.useCase.execute();
    return Response.json(tenants);
  }
}
