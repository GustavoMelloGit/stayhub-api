import type {
  Controller,
  HttpControllerMethod,
} from "../../../presentation/controller/controller";
import { HealthController } from "../../../presentation/controller/health/health.controller";
import { AuthDi } from "../../di/auth_di";
import { PropertyDi } from "../../di/property_di";
import { TenantDi } from "../../di/tenant_di";
import { BunHttpControllerAdapter } from "../adapters/http_controller_adapter";

const tenantDi = new TenantDi();
const propertyDi = new PropertyDi();
const authDi = new AuthDi();

const healthController = new HealthController();

const tenantControllers = [
  tenantDi.makeListTenantsController(),
  tenantDi.makeCreateTenantController(),
];

const propertyControllers = [
  propertyDi.makeGetStayController(),
  propertyDi.makeBookStayController(),
];

const authControllers = [
  authDi.makeRegisterUserController(),
  authDi.makeSignInController(),
  authDi.makeGetUserController(),
];

const controllers = [
  ...tenantControllers,
  ...propertyControllers,
  ...authControllers,
  healthController,
];

const routeMap = new Map<
  string,
  Partial<Record<HttpControllerMethod, Controller>>
>();

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
