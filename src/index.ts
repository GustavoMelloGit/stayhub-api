import { TenantDi } from './infra/di/tenant_di';

const tenantDi = new TenantDi();
const listTenantsController = tenantDi.makeListTenantsController();

function main() {
  const server = Bun.serve({
    port: 3030,
    fetch(req) {
      return listTenantsController.handle();
    },
  });

  console.log(`Listening on http://localhost:${server.port} ...`);
}

main();
