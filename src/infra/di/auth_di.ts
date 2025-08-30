import { type Hasher } from "../../application/service/hasher";
import {
  SessionManager,
  type ISessionManager,
} from "../../application/service/session_manager";
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

export class AuthDi {
  #authRepository: AuthRepository;
  #hasher: Hasher;
  #propertyRepository: PropertyRepository;
  #sessionManager: ISessionManager;

  constructor() {
    this.#authRepository = new AuthPostgresRepository();
    this.#hasher = new BunHasher();
    this.#propertyRepository = new PropertyPostgresRepository();
    this.#sessionManager = new SessionManager();
  }

  // Use Cases
  makeRegisterUserUseCase() {
    return new RegisterUserUseCase(
      this.#authRepository,
      this.#hasher,
      this.#propertyRepository,
      this.#sessionManager,
    );
  }

  makeSignInUseCase() {
    return new SignInUseCase(
      this.#authRepository,
      this.#hasher,
      this.#sessionManager,
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
