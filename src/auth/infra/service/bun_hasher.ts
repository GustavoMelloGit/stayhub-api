import type { Hasher } from "../../application/service/hasher";

export class BunHasher implements Hasher {
  async compare(value: string, hash: string): Promise<boolean> {
    return Bun.password.verify(value, hash);
  }

  async hash(value: string): Promise<string> {
    // Salt is handled automatically by Bun
    return Bun.password.hash(value);
  }
}
