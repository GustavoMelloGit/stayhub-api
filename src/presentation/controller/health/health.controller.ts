import { HttpControllerMethod, type Controller } from "../controller";

export class HealthController implements Controller {
  path = "/health";
  method = HttpControllerMethod.GET;

  async handle() {
    return { message: "OK" };
  }
}
