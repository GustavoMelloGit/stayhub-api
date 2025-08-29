import { UnauthorizedError } from "../error/unauthorized_error";
import type { Cache } from "./cache";
import type { Encrypter } from "./encrypter";

export interface ISessionManager {
  createSession(userId: string): Promise<string>;
  verifySession(token: string): Promise<{ userId: string }>;
}

export class SessionManager implements ISessionManager {
  constructor(
    private readonly cache: Cache,
    private readonly encrypter: Encrypter,
  ) {}

  async createSession(userId: string): Promise<string> {
    const token = await this.encrypter.sign(userId);

    const oneDayInSeconds = 60 * 60 * 24;
    await this.cache.set(
      this.cache.authCacheKey(userId),
      token,
      oneDayInSeconds,
    );

    return token;
  }

  async verifySession(token: string): Promise<{ userId: string }> {
    const userId = await this.encrypter.verify(token);

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const cachedToken = await this.cache.get(this.cache.authCacheKey(userId));

    if (cachedToken !== token || !cachedToken) {
      throw new UnauthorizedError("Unauthorized");
    }

    return { userId };
  }
}
