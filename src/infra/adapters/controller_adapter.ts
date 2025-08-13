import type {
  Controller,
  ControllerRequest,
  HttpControllerMethod,
} from "../../presentation/controller/controller";

class ControllerRequestParser {
  constructor(
    private readonly request: Request,
    private readonly controller: Controller,
  ) {}

  async parse(): Promise<ControllerRequest> {
    return {
      params: this.#parseParams(),
      body: await this.#parseBody(),
      query: this.#parseQuery(),
      headers: this.#parseHeaders(),
      method: this.request.method as HttpControllerMethod,
      url: this.request.url,
    };
  }

  #parseParams(): Record<string, string> {
    const path = this.controller.path;
    const pathParts = path.split("/");
    const params = pathParts.map((part) =>
      part.startsWith(":") ? part.slice(1) : null,
    );

    const paramsObject = params.reduce(
      (acc, param, index) => {
        if (!param) {
          return acc;
        }
        const url = new URL(this.request.url);
        const pathname = url.pathname.split("/");
        if (!pathname[index]) {
          return acc;
        }
        acc[param] = pathname[index];
        return acc;
      },
      {} as Record<string, string>,
    );

    return paramsObject;
  }

  async #parseBody(): Promise<Record<string, unknown>> {
    if (this.request.body === null) {
      return {};
    }

    const body = await this.request.json();

    if (!body) {
      return {};
    }

    if (typeof body !== "object") {
      return {};
    }

    return body as Record<string, unknown>;
  }

  #parseQuery(): Record<string, string> {
    const url = new URL(this.request.url);

    const query = Object.fromEntries(url.searchParams.entries());

    return query;
  }

  #parseHeaders(): Record<string, string> {
    return Object.fromEntries(this.request.headers.entries());
  }
}

export function BunControllerAdapter(controller: Controller) {
  return async function (request: Request) {
    const controllerRequestParser = new ControllerRequestParser(
      request,
      controller,
    );
    const controllerRequest = await controllerRequestParser.parse();
    return controller.handle(controllerRequest);
  };
}
