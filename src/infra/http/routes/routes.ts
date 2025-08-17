import { HealthController } from "../../../presentation/controller/health/health.controller";
import { AuthDi } from "../../di/auth_di";
import { StayDi } from "../../di/stay_di";
import { TenantDi } from "../../di/tenant_di";
import { BunHttpControllerAdapter } from "../adapters/http_controller_adapter";

const tenantDi = new TenantDi();
const stayDi = new StayDi();
const authDi = new AuthDi();

const listTenantsController = tenantDi.makeListTenantsController();
const createTenantController = tenantDi.makeCreateTenantController();
const getStayController = stayDi.makeGetStayController();
const createStayController = stayDi.makeBookStayController();
const addUserController = authDi.makeRegisterUserController();
const signInController = authDi.makeSignInController();
const getUserController = authDi.makeGetUserController();
const healthController = new HealthController();

const controllers = [
  listTenantsController,
  createTenantController,
  getStayController,
  createStayController,
  addUserController,
  signInController,
  getUserController,
  healthController,
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
