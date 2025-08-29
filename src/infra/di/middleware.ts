import type { Cache } from "../../application/service/cache";
import type { Encrypter } from "../../application/service/encrypter";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import { AuthMiddleware } from "../../presentation/middleware/auth.middleware";
import { AuthPostgresRepository } from "../database/postgres_repository/auth_postgres_repository";
import { JwtEncrypter } from "../service/jwt_encrypter";
import { RedisCache } from "../service/redis";

export class MiddlewareDi {
  #authRepository: AuthRepository;
  #encrypter: Encrypter;
  #cache: Cache;

  constructor() {
    this.#authRepository = new AuthPostgresRepository();
    this.#encrypter = new JwtEncrypter();
    this.#cache = new RedisCache();
  }

  makeAuthMiddleware() {
    return new AuthMiddleware(
      this.#authRepository,
      this.#encrypter,
      this.#cache,
    );
  }
}
