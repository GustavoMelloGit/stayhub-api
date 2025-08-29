import type { AuthRepository } from "../../../domain/repository/auth_repository";
import { UnauthorizedError } from "../../error/unauthorized_error";
import type { Cache } from "../../service/cache";
import type { Encrypter } from "../../service/encrypter";
import type { Hasher } from "../../service/hasher";
import type { UseCase } from "../use_case";

type Input = {
  email: string;
  password: string;
};

type Output = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export class SignInUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hasher: Hasher,
    private readonly encrypter: Encrypter,
    private readonly cache: Cache,
  ) {}

  async execute(input: Input): Promise<Output> {
    const user = await this.authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new UnauthorizedError("Incorrect e-mail or password");
    }

    const isPasswordValid = await this.hasher.compare(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Incorrect e-mail or password");
    }

    const token = await this.encrypter.sign(user.id);

    const oneDayInSeconds = 60 * 60 * 24;
    await this.cache.set(
      this.cache.authCacheKey(user.id),
      token,
      oneDayInSeconds,
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
