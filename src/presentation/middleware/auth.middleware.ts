import { UnauthorizedError } from "../../application/error/unauthorized_error";
import type { Encrypter } from "../../application/service/encrypter";
import type { User } from "../../domain/entity/user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { ControllerRequest } from "../controller/controller";

export class AuthMiddleware {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly encrypter: Encrypter,
  ) {}

  async handle(request: ControllerRequest): Promise<User> {
    const token = request.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Unauthorized");
    }

    const decodedToken = await this.encrypter.verify(token);

    const user = await this.authRepository.findUserById(decodedToken);
    if (!user) {
      throw new UnauthorizedError("Unauthorized");
    }

    return user;
  }
}
