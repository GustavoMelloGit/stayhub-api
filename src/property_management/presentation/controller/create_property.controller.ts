import z from "zod";
import type { CreatePropertyUseCase } from "../../application/use_case/create_property";
import type { User } from "../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import { ValidationError } from "../../../core/application/error/validation_error";

const inputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    number: z.string().min(1, "Number is required"),
    neighborhood: z.string().min(1, "Neighborhood is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip_code: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
    complement: z.string().default(""),
  }),
  images: z.array(z.string()).min(1, "At least one image is required"),
  capacity: z.number().int().positive("Capacity must be greater than 0"),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Controller para criar uma nova propriedade
 */
export class CreatePropertyController implements Controller {
  path = "/property";
  method = HttpControllerMethod.POST;

  constructor(private readonly useCase: CreatePropertyUseCase) {}

  #validate(request: ControllerRequest): Input {
    const data: Record<string, unknown> = request.body;

    const parsedInput = inputSchema.safeParse(data);

    if (!parsedInput.success) {
      const errors = z.prettifyError(parsedInput.error);
      throw new ValidationError(`Validation errors: ${JSON.stringify(errors)}`);
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest, user: User) {
    const validationResponse = this.#validate(request);

    const output = await this.useCase.execute({
      name: validationResponse.name,
      user_id: user.id,
      address: validationResponse.address,
      images: validationResponse.images,
      capacity: validationResponse.capacity,
    });

    return output;
  }
}
