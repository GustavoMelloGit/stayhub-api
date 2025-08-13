import { StayDi } from "../../di/stay_di";
import { TenantDi } from "../../di/tenant_di";
import { BunHttpControllerAdapter } from "../adapters/http_controller_adapter";

const tenantDi = new TenantDi();
const stayDi = new StayDi();

const listTenantsController = tenantDi.makeListTenantsController();
const createTenantController = tenantDi.makeCreateTenantController();
const getStayController = stayDi.makeGetStayController();
const createStayController = stayDi.makeCreateStayController();

const controllers = [
  listTenantsController,
  createTenantController,
  getStayController,
  createStayController,
];

const routeMap = new Map();

controllers.forEach((controller) => {
  const alreadyExists = routeMap.get(controller.path);
  if (!alreadyExists) {
    routeMap.set(controller.path, {
      [controller.method]: BunHttpControllerAdapter(controller),
    });
  }
  routeMap.set(controller.path, {
    ...alreadyExists,
    [controller.method]: BunHttpControllerAdapter(controller),
  });
});

export const bunRoutes = Object.fromEntries(routeMap.entries());
