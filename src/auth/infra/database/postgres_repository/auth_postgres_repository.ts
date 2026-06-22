import { eq, inArray } from "drizzle-orm";
import { User, type UserData } from "../../../domain/entity/user";
import type { AuthRepository } from "../../../domain/repository/auth_repository";
import { db } from "../../../../core/infra/database/drizzle/database";
import {
  usersTable,
  propertiesTable,
  addressesTable,
  externalBookingSources,
} from "../../../../core/infra/database/drizzle/schema";

export class AuthPostgresRepository implements AuthRepository {
  async findUserById(id: string): Promise<User | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });

    return user ? User.reconstitute(user) : null;
  }

  async addUser(input: User): Promise<User> {
    const data: UserData = {
      id: input.id,
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      created_at: input.created_at,
      updated_at: input.updated_at,
      deleted_at: input.deleted_at,
    };
    const result = await db.insert(usersTable).values(data).returning();

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

  async purgeUserData(userId: string): Promise<void> {
    const properties = await db.query.propertiesTable.findMany({
      where: eq(propertiesTable.user_id, userId),
      columns: { id: true, address_id: true },
    });

    const propertyIds = properties.map(p => p.id);
    const addressIds = properties.map(p => p.address_id);

    if (propertyIds.length > 0) {
      await db
        .delete(externalBookingSources)
        .where(inArray(externalBookingSources.property_id, propertyIds));
    }

    await db.delete(usersTable).where(eq(usersTable.id, userId));

    if (addressIds.length > 0) {
      await db
        .delete(addressesTable)
        .where(inArray(addressesTable.id, addressIds));
    }
  }
}
