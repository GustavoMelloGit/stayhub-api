import { Property } from "../../../booking/domain/entity/property";
import { User } from "../../domain/entity/user";
import type { AuthRepository } from "../../domain/repository/auth_repository";
import type { PropertyRepository } from "../../../booking/domain/repository/property_repository";
import { ConflictError } from "../../../core/application/error/conflict_error";
import type { Hasher } from "../service/hasher";
import type { ISessionManager } from "../service/session_manager";
import type { UseCase } from "../../../booking/application/use_case/use_case";

type Input = {
  name: string;
  email: string;
  password: string;
};

type Output = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
  };
};

export class RegisterUserUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly hasher: Hasher,
    private readonly propertyRepository: PropertyRepository,
    private readonly sessionManager: ISessionManager,
  ) {}

  async execute(input: Input): Promise<Output> {
    const existingUser = await this.userRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await this.hasher.hash(input.password);

    const user = User.create({ ...input, password: hashedPassword });

    const savedUser = await this.userRepository.addUser(user);

    const property = Property.create({
      name: `${input.name}'s Property`,
      user_id: savedUser.id,
    });

    await this.propertyRepository.addProperty(property);

    const token = await this.sessionManager.createSession(savedUser.id);

    return {
      token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        created_at: savedUser.created_at,
        updated_at: savedUser.updated_at,
      },
    };
  }
}
