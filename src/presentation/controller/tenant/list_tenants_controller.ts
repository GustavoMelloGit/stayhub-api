import { ListTenantsUseCase } from '../../../application/use_case/tenant/list_tenents';
import { HttpControllerMethod, type Controller } from '../controller';

export class ListTenantsController implements Controller {
  path = '/tenants';
  method = HttpControllerMethod.GET;

  constructor(private readonly useCase: ListTenantsUseCase) {}

  async handle(): Promise<Response> {
    const tenants = await this.useCase.execute();
    return Response.json(tenants);
  }
}
