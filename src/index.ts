import { BunControllerAdapter } from './infra/adapters/controller_adapter';
import { TenantDi } from './infra/di/tenant_di';

const tenantDi = new TenantDi();
const listTenantsController = tenantDi.makeListTenantsController();

const controllers = [listTenantsController];

function main() {
  const server = Bun.serve({
    port: 3030,
    routes: {
      ...controllers.reduce<
        Record<string, (req: Request) => Promise<Response>>
      >((acc, controller) => {
        acc[controller.path] = BunControllerAdapter(controller);
        return acc;
      }, {}),
    },
  });

  console.log(`Listening on http://localhost:${server.port} ...`);
}

main();
