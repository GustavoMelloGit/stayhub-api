import type { User } from "../../../auth/domain/entity/user";

export enum HttpControllerMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}

export type ControllerRequest = {
  params: Record<string, string>;
  body: Record<string, unknown>;
  query: Record<string, string>;
  headers: Record<string, string>;
  method: HttpControllerMethod;
  url: string;
};

export type AuthenticatedControllerRequest = ControllerRequest & {
  user: User;
};

export interface Controller {
  path: string;
  method: HttpControllerMethod;
  handle(request: ControllerRequest, user?: User): Promise<unknown>;
}
