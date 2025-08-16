import { type Hasher } from "../../application/service/hasher";
import { RegisterUserUseCase } from "../../application/use_case/auth/register_user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { CalendarRepository } from "../../domain/repository/calendar_repository";
import { RegisterUserController } from "../../presentation/controller/auth/register_user.controller";
import { AuthPostgresRepository } from "../database/postgres_repository/auth_postgres_repository";
import { CalendarPostgresRepository } from "../database/postgres_repository/calendar_postgres_repository";
import { BunHasher } from "../service/bun_hasher";

export class AuthDi {
  #authRepository: AuthRepository;
  #hasher: Hasher;
  #calendarRepository: CalendarRepository;

  constructor() {
    this.#authRepository = new AuthPostgresRepository();
    this.#hasher = new BunHasher();
    this.#calendarRepository = new CalendarPostgresRepository();
  }

  // Use Cases
  makeRegisterUserUseCase() {
    return new RegisterUserUseCase(
      this.#authRepository,
      this.#hasher,
      this.#calendarRepository,
    );
  }

  // Controllers
  makeRegisterUserController() {
    return new RegisterUserController(this.makeRegisterUserUseCase());
  }
}
