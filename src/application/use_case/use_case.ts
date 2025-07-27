export interface UseCase<I = unknown, O = unknown> {
  execute(input: I): Promise<O>;
}
