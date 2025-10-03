import { eq } from "drizzle-orm";
import { User } from "../../../domain/entity/user";
import type { AuthRepository } from "../../../domain/repository/auth_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import { usersTable } from "../../../../core/infra/database/drizzle/schema";

export class AuthPostgresRepository implements AuthRepository {
  async findUserById(id: string): Promise<User | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });

    return user ? User.reconstitute(user) : null;
  }

  async addUser(input: User): Promise<User> {
    const result = await db.insert(usersTable).values(input).returning();

    const user = result[0];

    if (!user) {
      throw new Error("Failed to save user");
    }

    return User.reconstitute(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    return user ? User.reconstitute(user) : null;
  }
}
