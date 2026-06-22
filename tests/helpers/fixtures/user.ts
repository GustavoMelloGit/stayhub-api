import { User } from "../../../src/auth/domain/entity/user";
import { AuthPostgresRepository } from "../../../src/auth/infra/database/postgres_repository/auth_postgres_repository";
import { db } from "../../../src/core/infra/database/drizzle/database";
import { usersTable } from "../../../src/core/infra/database/drizzle/schema";

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

export async function createAdminFixture(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; plainPassword: string }> {
  const hashedPassword = await Bun.password.hash(input.password);

  const id = crypto.randomUUID();
  const now = new Date();

  const result = await db
    .insert(usersTable)
    .values({
      id,
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: "admin",
      created_at: now,
      updated_at: now,
    })
    .returning();

  const row = result[0];
  if (!row) {
    throw new Error("Failed to create admin fixture");
  }

  const user = User.reconstitute({
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role as "admin",
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at ?? null,
  });

  return { user, plainPassword: input.password };
}
