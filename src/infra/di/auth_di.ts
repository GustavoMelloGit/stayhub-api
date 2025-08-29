import type { Cache } from "../../application/service/cache";
import type { Encrypter } from "../../application/service/encrypter";
import { type Hasher } from "../../application/service/hasher";
import { RegisterUserUseCase } from "../../application/use_case/auth/register_user";
import { SignInUseCase } from "../../application/use_case/auth/sign_in";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import { GetUserController } from "../../presentation/controller/auth/get_user.controller";
import { RegisterUserController } from "../../presentation/controller/auth/register_user.controller";
import { SignInController } from "../../presentation/controller/auth/sign_in.controller";
import { AuthPostgresRepository } from "../database/postgres_repository/auth_postgres_repository";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { BunHasher } from "../service/bun_hasher";
import { JwtEncrypter } from "../service/jwt_encrypter";
import { RedisCache } from "../service/redis";

export class AuthDi {
  #authRepository: AuthRepository;
  #hasher: Hasher;
  #propertyRepository: PropertyRepository;
  #encrypter: Encrypter;
  #cache: Cache;

  constructor() {
    this.#authRepository = new AuthPostgresRepository();
    this.#hasher = new BunHasher();
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#encrypter = new JwtEncrypter();
    this.#cache = new RedisCache();
  }

  // Use Cases
  makeRegisterUserUseCase() {
    return new RegisterUserUseCase(
      this.#authRepository,
      this.#hasher,
      this.#propertyRepository,
    );
  }

  makeSignInUseCase() {
    return new SignInUseCase(
      this.#authRepository,
      this.#hasher,
      this.#encrypter,
      this.#cache,
    );
  }

  // Controllers
  makeRegisterUserController() {
    return new RegisterUserController(this.makeRegisterUserUseCase());
  }
  makeSignInController() {
    return new SignInController(this.makeSignInUseCase());
  }
  makeGetUserController() {
    return new GetUserController();
  }
}
