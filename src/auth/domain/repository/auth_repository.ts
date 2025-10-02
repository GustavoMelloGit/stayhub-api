import type { User } from "../entity/user";

export interface AuthRepository {
  addUser(input: User): Promise<User>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
}
