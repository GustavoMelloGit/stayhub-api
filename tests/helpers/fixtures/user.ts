import { User } from "../../../src/auth/domain/entity/user";
import { AuthPostgresRepository } from "../../../src/auth/infra/database/postgres_repository/auth_postgres_repository";

export async function createUserFixture(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; plainPassword: string }> {
  const hashedPassword = await Bun.password.hash(input.password);

  const entity = User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  const repository = new AuthPostgresRepository();
  const user = await repository.addUser(entity);

  return { user, plainPassword: input.password };
}
