export type ControllerRequest = {
  params: Record<string, string>;
  body: Record<string, unknown>;
  query: Record<string, string>;
  headers: Record<string, string>;
  method: string;
  url: string;
};

export interface Controller {
  path: string;
  handle(request: ControllerRequest): Promise<Response>;
}
