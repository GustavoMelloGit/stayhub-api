import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../../core/application/error/unauthorized_error";
import { env } from "../../../core/infra/config/environments";
import type { UserRole } from "../../domain/entity/user";

export interface ISessionManager {
  createSession(userId: string, role: UserRole): Promise<string>;
  verifySession(token: string): Promise<{ userId: string; role: UserRole }>;
}

export class SessionManager implements ISessionManager {
  constructor() {}

  async createSession(userId: string, role: UserRole): Promise<string> {
    const token = this.#sign(userId, role);

    return token;
  }

  async verifySession(
    token: string
  ): Promise<{ userId: string; role: UserRole }> {
    const payload = this.#verify(token);

    if (!payload.userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    return payload;
  }

  #sign(userId: string, role: UserRole): string {
    return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: "1d" });
  }

  #verify(token: string): { userId: string; role: UserRole } {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      if (typeof decoded !== "object" || !("userId" in decoded)) {
        throw new UnauthorizedError("Unauthorized");
      }

      const role: UserRole =
        "role" in decoded &&
        (decoded.role === "admin" || decoded.role === "user")
          ? (decoded.role as UserRole)
          : "user";

      return { userId: decoded.userId as string, role };
    } catch {
      throw new UnauthorizedError("Unauthorized");
    }
  }
}
