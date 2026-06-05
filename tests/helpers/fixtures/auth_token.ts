import { SessionManager } from "../../../src/auth/application/service/session_manager";

export async function createAuthToken(userId: string): Promise<string> {
  const sessionManager = new SessionManager();
  return sessionManager.createSession(userId);
}
