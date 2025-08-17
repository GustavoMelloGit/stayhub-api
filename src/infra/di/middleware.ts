import type { Encrypter } from "../../application/service/encrypter";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import { AuthMiddleware } from "../../presentation/middleware/auth.middleware";
import { AuthPostgresRepository } from "../database/postgres_repository/auth_postgres_repository";
import { JwtEncrypter } from "../service/jwt_encrypter";

export class MiddlewareDi {
  #authRepository: AuthRepository;
  #encrypter: Encrypter;

  constructor() {
    this.#authRepository = new AuthPostgresRepository();
    this.#encrypter = new JwtEncrypter();
  }

  makeAuthMiddleware() {
    return new AuthMiddleware(this.#authRepository, this.#encrypter);
  }
}
