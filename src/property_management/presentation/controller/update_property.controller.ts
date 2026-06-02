import z from "zod";
import type { UpdatePropertyUseCase } from "../../application/use_case/update_property";
import type { User } from "../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";

const inputSchema = z.object({
  property_id: z.uuid(),
  name: z.string().min(1, "Name is required").optional(),
  address: z
    .object({
      street: z.string().min(1, "Street is required"),
      number: z.string().min(1, "Number is required"),
      neighborhood: z.string().min(1, "Neighborhood is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zip_code: z.string().min(1, "Zip code is required"),
      country: z.string().min(1, "Country is required"),
      complement: z.string().default(""),
    })
    .partial()
    .optional(),
  images: z.array(z.string()).min(1, "Images are required").optional(),
  capacity: z
    .number()
    .int()
    .positive("Capacity must be greater than 0")
    .optional(),
});

type Input = z.infer<typeof inputSchema>;

export class UpdatePropertyController implements Controller {
  path = "/property/:property_id";
  method = HttpControllerMethod.PATCH;
  inputSchema = inputSchema;

  constructor(private readonly useCase: UpdatePropertyUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const input = request.body as Input;

    const output = await this.useCase.execute({
      property_id: input.property_id,
      user_id: user.id,
      update_data: {
        name: input.name,
        address: input.address,
        images: input.images,
        capacity: input.capacity,
      },
    });

    return output;
  }
}
