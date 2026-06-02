import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodTypeAny } from "zod";
import type {
  OpenApiRequestBody,
  OpenApiResponse,
} from "../../../presentation/open_api/open_api_types";

export function bodyFromZod(
  schema: ZodTypeAny,
  opts?: {
    description?: string;
    required?: boolean;
    example?: Record<string, unknown>;
  }
): OpenApiRequestBody {
  return {
    description: opts?.description,
    required: opts?.required ?? true,
    content: {
      "application/json": {
        schema: zodToJsonSchema(schema, {
          target: "openApi3",
        }) as Record<string, unknown>,
        example: opts?.example,
      },
    },
  };
}

export function responseFromZod(
  description: string,
  schema: ZodTypeAny
): OpenApiResponse {
  return {
    description,
    content: {
      "application/json": {
        schema: zodToJsonSchema(schema, {
          target: "openApi3",
        }) as Record<string, unknown>,
      },
    },
  };
}

export function errorResponse(description: string): OpenApiResponse {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  };
}

export function validationErrorResponse(): OpenApiResponse {
  return errorResponse("Validation error — invalid request body");
}
