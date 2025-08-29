import { RedisClient } from "bun";
import { env } from "../config/environments";
import type { Cache } from "../../application/service/cache";

const client = new RedisClient(
  `redis://${env.REDIS_USERNAME}:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`,
);

export class RedisCache implements Cache {
  async get<T>(key: string): Promise<T | null> {
    const item = await client.get(key);

    return item ? (JSON.parse(item) as T) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringifiedValue = JSON.stringify(value);

    await client.set(key, stringifiedValue);

    if (ttl) {
      await client.expire(key, ttl);
    }
  }

  async delete(key: string): Promise<void> {
    await client.del(key);
  }
}
