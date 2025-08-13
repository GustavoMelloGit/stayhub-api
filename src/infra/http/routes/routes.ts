import { StayDi } from "../../di/stay_di";
import { TenantDi } from "../../di/tenant_di";
import { BunHttpControllerAdapter } from "../adapters/http_controller_adapter";

const tenantDi = new TenantDi();
const listTenantsController = tenantDi.makeListTenantsController();

const stayDi = new StayDi();
const getStayController = stayDi.makeGetStayController();

const controllers = [listTenantsController, getStayController];

export const bunRoutes = controllers.reduce<
  Record<string, (req: Request) => Promise<Response>>
>((acc, controller) => {
  acc[controller.path] = BunHttpControllerAdapter(controller);
  return acc;
}, {});
