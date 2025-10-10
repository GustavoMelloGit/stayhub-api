import {
  HttpControllerMethod,
  type Controller,
} from "../../../presentation/controller/controller";
import { HealthController } from "../../../presentation/controller/health/health.controller";
import { CorsMiddleware } from "../../../presentation/middleware/cors.middleware";
import { AuthDi } from "../../../../auth/infra/di/auth_di";
import { PropertyDi } from "../../../../booking/infra/di/property_di";
import { StayDi } from "../../../../booking/infra/di/stay_di";
import { TenantDi } from "../../../../booking/infra/di/tenant_di";
import { BunHttpControllerAdapter } from "../adapters/http_controller_adapter";
import { FinanceDi } from "../../../../finance/infra/di/finance_di";
import { PropertyManagementDi } from "../../../../property_management/infra/di/property_management_di";

const tenantDi = new TenantDi();
const propertyDi = new PropertyDi();
const authDi = new AuthDi();
const stayDi = new StayDi();
const corsMiddleware = new CorsMiddleware();
const financeDi = new FinanceDi();
const propertyManagementDi = new PropertyManagementDi();

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
  {
    authenticated: true,
    controller: propertyDi.makeCreateExternalBookingSourceController(),
  },
];

const financeControllers: Route[] = [
  {
    authenticated: true,
    controller: financeDi.makeRecordExpenseController(),
  },
  {
    authenticated: true,
    controller: financeDi.makeRecordRevenueController(),
  },
  {
    authenticated: true,
    controller: financeDi.makeFindPropertyFinancialMovementsController(),
  },
];

const propertyManagementControllers: Route[] = [
  {
    authenticated: true,
    controller: propertyManagementDi.makeUpdatePropertyController(),
  },
  {
    authenticated: true,
    controller: propertyManagementDi.makeFindUserPropertiesController(),
  },
  {
    authenticated: true,
    controller: propertyManagementDi.makeFindPropertyController(),
  },
];

const stayControllers: Route[] = [
  {
    authenticated: true,
    controller: stayDi.makeGetStayController(),
  },
  {
    authenticated: false,
    controller: stayDi.makeGetPublicStayController(),
  },
  {
    authenticated: true,
    controller: stayDi.makeFindPropertyStaysController(),
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
  ...financeControllers,
  ...propertyManagementControllers,
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
      // Add OPTIONS handler for CORS preflight
      [HttpControllerMethod.OPTIONS]: async (request: Request) =>
        corsMiddleware.handlePreflightRequest(request),
    });
  } else {
    routeMap.set(controller.path, {
      ...alreadyExists,
      [controller.method]: BunHttpControllerAdapter(controller, authenticated),
      // Add OPTIONS handler for CORS preflight
      [HttpControllerMethod.OPTIONS]: async (request: Request) =>
        corsMiddleware.handlePreflightRequest(request),
    });
  }
});

export const bunRoutes = Object.fromEntries(routeMap.entries());
