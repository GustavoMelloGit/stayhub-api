import { SessionManager } from "../../../src/auth/application/service/session_manager";
import type { UserRole } from "../../../src/auth/domain/entity/user";

export async function createAuthToken(
  userId: string,
  role: UserRole = "user"
): Promise<string> {
  const sessionManager = new SessionManager();
  return sessionManager.createSession(userId, role);
}
