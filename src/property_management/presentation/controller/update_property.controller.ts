import z from "zod";
import type { UpdatePropertyUseCase } from "../../application/use_case/update_property";
import type { User } from "../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";
import { ValidationError } from "../../../core/application/error/validation_error";

const inputSchema = z.object({
  property_id: z.uuid(),
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  number: z.string().min(1, "Number is required").optional(),
  neighborhood: z.string().min(1, "Neighborhood is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  zip_code: z.string().min(1, "Zip code is required").optional(),
  country: z.string().min(1, "Country is required").optional(),
  complement: z.string().min(1, "Complement is required").optional(),
  images: z.array(z.string()).min(1, "Images are required").optional(),
  capacity: z
    .number()
    .int()
    .positive("Capacity must be greater than 0")
    .optional(),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Controller para atualizar dados de uma propriedade
 */
export class UpdatePropertyController implements Controller {
  path = "/property/:property_id";
  method = HttpControllerMethod.PATCH;

  constructor(private readonly useCase: UpdatePropertyUseCase) {}

  #validate(request: ControllerRequest): Input {
    const { property_id } = request.params;
    const data: Record<string, unknown> = request.body;
    data.property_id = property_id;

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
      property_id: validationResponse.property_id,
      user_id: user.id,
      update_data: {
        name: validationResponse.name,
        address: validationResponse.address,
        number: validationResponse.number,
        neighborhood: validationResponse.neighborhood,
        city: validationResponse.city,
        state: validationResponse.state,
        zip_code: validationResponse.zip_code,
        country: validationResponse.country,
        complement: validationResponse.complement,
        images: validationResponse.images,
        capacity: validationResponse.capacity,
      },
    });
    return output;
  }
}
