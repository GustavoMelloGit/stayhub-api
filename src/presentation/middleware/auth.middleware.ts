import { UnauthorizedError } from "../../application/error/unauthorized_error";
import type { Cache } from "../../application/service/cache";
import type { Encrypter } from "../../application/service/encrypter";
import type { User } from "../../domain/entity/user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { ControllerRequest } from "../controller/controller";

export class AuthMiddleware {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly encrypter: Encrypter,
    private readonly cache: Cache,
  ) {}

  async handle(request: ControllerRequest): Promise<User> {
    const token = request.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Unauthorized");
    }

    const userId = await this.encrypter.verify(token);

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const cachedToken = await this.cache.get(this.cache.authCacheKey(userId));

    if (cachedToken !== token || !cachedToken) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError("Unauthorized");
    }

    return user;
  }
}
