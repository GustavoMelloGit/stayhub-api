import jwt from "jsonwebtoken";
import type { Encrypter } from "../../application/service/encrypter";
import { env } from "../config/environments";

export class JwtEncrypter implements Encrypter {
  async sign(payload: string): Promise<string> {
    return jwt.sign(payload, env.JWT_SECRET);
  }

  async verify(token: string): Promise<string> {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    return decoded as string;
  }
}
