import type { User } from "../../../auth/domain/entity/user";

export interface UseCase<I = unknown, O = unknown> {
  execute(input: I, user: User): Promise<O>;
}
