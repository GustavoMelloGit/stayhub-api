import type { AuthRepository } from "../../../domain/repository/auth_repository";
import { UnauthorizedError } from "../../error/unauthorized_error";
import type { Encrypter } from "../../service/encrypter";
import type { UseCase } from "../use_case";

type Input = {
  token: string;
};

type Output = {
  id: string;
  name: string;
  email: string;
};

export class GetUserUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly encrypter: Encrypter,
  ) {}

  async execute(input: Input): Promise<Output> {
    const decodedToken = await this.encrypter.verify(input.token);

    const user = await this.authRepository.findUserById(decodedToken);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
