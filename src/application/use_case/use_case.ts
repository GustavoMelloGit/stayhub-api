import type { User } from "../../domain/entity/user";

export interface UseCase<I = unknown, O = unknown> {
  execute(input: I, user: User): Promise<O>;
}
