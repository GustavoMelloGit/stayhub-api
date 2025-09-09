import type {
  Controller,
  HttpControllerMethod,
} from "../../../presentation/controller/controller";
import { HealthController } from "../../../presentation/controller/health/health.controller";
import { AuthDi } from "../../di/auth_di";
import { PropertyDi } from "../../di/property_di";
import { StayDi } from "../../di/stay_di";
import { TenantDi } from "../../di/tenant_di";
import { BunHttpControllerAdapter } from "../adapters/http_controller_adapter";

const tenantDi = new TenantDi();
const propertyDi = new PropertyDi();
const authDi = new AuthDi();
const stayDi = new StayDi();

type Route = {
  controller: Controller;
  authenticated: boolean;
};

const healthController: Route = {
  authenticated: false,
  controller: new HealthController(),
};

const tenantControllers: Route[] = [
  {
    authenticated: true,
    controller: tenantDi.makeListTenantsController(),
  },
  {
    authenticated: true,
    controller: tenantDi.makeCreateTenantController(),
  },
];

const propertyControllers: Route[] = [
  {
    authenticated: true,
    controller: propertyDi.makeBookStayController(),
  },
  {
    authenticated: true,
    controller: propertyDi.makeReconcileExternalBookingController(),
  },
];

const stayControllers: Route[] = [
  {
    authenticated: true,
    controller: stayDi.makeGetStayController(),
  },
];

const authControllers: Route[] = [
  {
    authenticated: false,
    controller: authDi.makeRegisterUserController(),
  },
  {
    authenticated: false,
    controller: authDi.makeSignInController(),
  },
  {
    authenticated: true,
    controller: authDi.makeGetUserController(),
  },
];

const controllers = [
  ...tenantControllers,
  ...propertyControllers,
  ...authControllers,
  ...stayControllers,
  healthController,
];

const routeMap = new Map<
  string,
  Partial<Record<HttpControllerMethod, (request: Request) => Promise<Response>>>
>();

controllers.forEach(({ authenticated, controller }) => {
  const alreadyExists = routeMap.get(controller.path);
  if (!alreadyExists) {
    routeMap.set(controller.path, {
      [controller.method]: BunHttpControllerAdapter(controller, authenticated),
    });
  }
  routeMap.set(controller.path, {
    ...alreadyExists,
    [controller.method]: BunHttpControllerAdapter(controller, authenticated),
  });
});

export const bunRoutes = Object.fromEntries(routeMap.entries());
