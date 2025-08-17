import { ConflictError } from "../../../application/error/conflict_error";
import { IllegalStateError } from "../../../application/error/illegal_state_error";
import { ResourceNotFoundError } from "../../../application/error/resource_not_found_error";
import { UnauthorizedError } from "../../../application/error/unauthorized_error";
import { ValidationError } from "../../../application/error/validation_error";
import type { User } from "../../../domain/entity/user";
import type {
  Controller,
  ControllerRequest,
  HttpControllerMethod,
} from "../../../presentation/controller/controller";
import { AuthMiddleware } from "../../../presentation/middleware/auth.middleware";
import { AuthPostgresRepository } from "../../database/postgres_repository/auth_postgres_repository";
import { JwtEncrypter } from "../../service/jwt_encrypter";

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

const errorCodeMap: Record<string, number> = {
  [ConflictError.name]: 409,
  [ValidationError.name]: 422,
  [ResourceNotFoundError.name]: 404,
  [UnauthorizedError.name]: 401,
  [IllegalStateError.name]: 500,
};

export function BunHttpControllerAdapter(
  controller: Controller,
  authenticated: boolean,
) {
  return async function (request: Request): Promise<Response> {
    try {
      const controllerRequestParser = new ControllerRequestParser(
        request,
        controller,
      );
      const controllerRequest = await controllerRequestParser.parse();

      let user: User | undefined;
      if (authenticated) {
        const authMiddleware = new AuthMiddleware(
          new AuthPostgresRepository(),
          new JwtEncrypter(),
        );
        user = await authMiddleware.handle(controllerRequest);
      }
      const response = await controller.handle(controllerRequest, user);

      return Response.json(response);
    } catch (e) {
      console.error(e);
      if (Error.isError(e)) {
        const errorCode = errorCodeMap[e.name];
        if (errorCode) {
          return Response.json({ message: e.message }, { status: errorCode });
        }
      }
      return Response.json(
        {
          message: "Internal server error",
        },
        {
          status: 500,
        },
      );
    }
  };
}
