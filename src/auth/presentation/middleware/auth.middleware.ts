import { UnauthorizedError } from "../../../core/application/error/unauthorized_error";
import type { ISessionManager } from "../../application/service/session_manager";
import type { User } from "../../domain/entity/user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { ControllerRequest } from "../../../core/presentation/controller/controller";

export class AuthMiddleware {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionManager: ISessionManager
  ) {}

  async handle(request: ControllerRequest): Promise<User> {
    const token = request.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { userId } = await this.sessionManager.verifySession(token);

    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedError("Unauthorized");
    }

    return user;
  }
}
