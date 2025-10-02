import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../../core/application/error/unauthorized_error";
import { env } from "../../../core/infra/config/environments";

export interface ISessionManager {
  createSession(userId: string): Promise<string>;
  verifySession(token: string): Promise<{ userId: string }>;
}

export class SessionManager implements ISessionManager {
  constructor() {}

  async createSession(userId: string): Promise<string> {
    const token = this.#sign(userId);

    return token;
  }

  async verifySession(token: string): Promise<{ userId: string }> {
    const userId = this.#verify(token);

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    return { userId };
  }

  #sign(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "1d" });
  }

  #verify(token: string): string {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      if (typeof decoded !== "object" || !("userId" in decoded)) {
        throw new UnauthorizedError("Unauthorized");
      }

      return decoded.userId as string;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedError("Unauthorized");
    }
  }
}
