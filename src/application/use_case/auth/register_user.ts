import { Property } from "../../../domain/entity/property";
import { User } from "../../../domain/entity/user";
import type { AuthRepository } from "../../../domain/repository/auth_repository";
import type { PropertyRepository } from "../../../domain/repository/property_repository";
import { ConflictError } from "../../error/conflict_error";
import type { Hasher } from "../../service/hasher";
import type { UseCase } from "../use_case";

type Input = {
  name: string;
  email: string;
  password: string;
};

type Output = {
  id: string;
  name: string;
  email: string;
};

export class RegisterUserUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly hasher: Hasher,
    private readonly propertyRepository: PropertyRepository,
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

    await this.propertyRepository.save(property);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
    };
  }
}
