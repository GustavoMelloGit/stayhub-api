import { type Hasher } from "../../application/service/hasher";
import { AddUserUseCase } from "../../application/use_case/auth/add_user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import { AddUserController } from "../../presentation/controller/auth/add_user.controller";
import { AuthPostgresRepository } from "../database/postgres_repository/auth_postgres_repository";
import { BunHasher } from "../service/bun_hasher";

export class AuthDi {
  #authRepository: AuthRepository;
  #hasher: Hasher;

  constructor() {
    this.#authRepository = new AuthPostgresRepository();
    this.#hasher = new BunHasher();
  }

  // Use Cases
  makeAddUserUseCase() {
    return new AddUserUseCase(this.#authRepository, this.#hasher);
  }

  // Controllers
  makeAddUserController() {
    return new AddUserController(this.makeAddUserUseCase());
  }
}
