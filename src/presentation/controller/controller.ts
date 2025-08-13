export enum HttpControllerMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type ControllerRequest = {
  params: Record<string, string>;
  body: Record<string, unknown>;
  query: Record<string, string>;
  headers: Record<string, string>;
  method: HttpControllerMethod;
  url: string;
};

export interface Controller {
  path: string;
  method: HttpControllerMethod;
  handle(request: ControllerRequest): Promise<unknown>;
}
