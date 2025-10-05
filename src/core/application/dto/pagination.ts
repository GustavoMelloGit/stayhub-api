import { z } from "zod";

/**
 * Parâmetros de entrada para paginação
 */
export const paginationInputSchema = z.object({
  page: z.int().positive().default(1),
  limit: z.int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationInputSchema>;

/**
 * Resultado paginado com metadados
 */
export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

/**
 * Calcula os metadados de paginação
 */
export function calculatePaginationMetadata(
  page: number,
  limit: number,
  total: number
): PaginatedResult<never>["pagination"] {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}
