import {
  HttpControllerMethod,
  type Controller,
} from "../../../presentation/controller/controller";

export class HealthController implements Controller {
  path = "/health";
  method = HttpControllerMethod.GET;

  async handle() {
    return { message: "System is healthy" };
  }
}
