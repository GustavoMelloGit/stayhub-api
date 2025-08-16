import { type Hasher } from "../../application/service/hasher";
import { RegisterUserUseCase } from "../../application/use_case/auth/register_user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { PropertyRepository } from "../../domain/repository/property_repository";
import { RegisterUserController } from "../../presentation/controller/auth/register_user.controller";
import { AuthPostgresRepository } from "../database/postgres_repository/auth_postgres_repository";
import { PropertyPostgresRepository } from "../database/postgres_repository/property_postgres_repository";
import { BunHasher } from "../service/bun_hasher";

export class AuthDi {
  #authRepository: AuthRepository;
  #hasher: Hasher;
  #propertyRepository: PropertyRepository;

  constructor() {
    this.#authRepository = new AuthPostgresRepository();
    this.#hasher = new BunHasher();
    this.#propertyRepository = new PropertyPostgresRepository();
  }

  // Use Cases
  makeRegisterUserUseCase() {
    return new RegisterUserUseCase(
      this.#authRepository,
      this.#hasher,
      this.#propertyRepository,
    );
  }

  // Controllers
  makeRegisterUserController() {
    return new RegisterUserController(this.makeRegisterUserUseCase());
  }
}
