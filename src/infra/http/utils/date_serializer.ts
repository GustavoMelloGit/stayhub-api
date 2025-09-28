import { formatISO } from "date-fns";

/**
 * Serializa recursivamente todas as datas em um objeto para formato ISO string
 * Funciona com objetos simples, arrays e objetos aninhados
 */
export function serializeDatesRecursively(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Se é uma data, serializa para ISO string
  if (obj instanceof Date) {
    return formatISO(obj);
  }

  // Se é um array, serializa cada elemento
  if (Array.isArray(obj)) {
    return obj.map(serializeDatesRecursively);
  }

  // Se é um objeto, serializa cada propriedade
  if (typeof obj === "object") {
    const serialized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDatesRecursively(value);
    }

    return serialized;
  }

  // Para primitivos (string, number, boolean), retorna como está
  return obj;
}
