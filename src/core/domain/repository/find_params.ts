import type { PaginationInput } from "../../application/dto/pagination";

export type FindParams<T> = {
  filters: Partial<T>;
  pagination: PaginationInput;
};
