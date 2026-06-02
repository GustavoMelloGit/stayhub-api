import z from "zod";
import { ValidationError } from "../../../../core/application/error/validation_error";
import type { SignInUseCase } from "../../../../auth/application/use_case/sign_in";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../../core/presentation/controller/controller";
import type { OpenApiOperation } from "../../../../core/presentation/open_api/open_api_types";

const inputSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type Input = z.infer<typeof inputSchema>;

export class SignInController implements Controller {
  path = "/auth/sign-in";
  method = HttpControllerMethod.POST;

  openApiSpec: OpenApiOperation = {
    summary: "Sign in",
    description:
      "Authenticates a user with email and password, returning a JWT token.",
    tags: ["Auth"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: {
                type: "string",
                format: "email",
                example: "user@example.com",
              },
              password: {
                type: "string",
                format: "password",
                example: "password123",
              },
            },
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Successfully authenticated",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "JWT bearer token",
                },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
      "401": {
        description: "Invalid credentials",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Incorrect e-mail or password",
                },
              },
            },
          },
        },
      },
      "422": {
        description: "Validation error — invalid request body",
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
      },
    },
  };

  constructor(private readonly useCase: SignInUseCase) {}

  #validate(request: ControllerRequest): Input {
    const parsedInput = inputSchema.safeParse(request.body);

    if (!parsedInput.success) {
      throw new ValidationError(parsedInput.error.message);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute(validationResponse);

    return output;
  }
}
