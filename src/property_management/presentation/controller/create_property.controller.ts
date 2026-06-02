import z from "zod";
import type { CreatePropertyUseCase } from "../../application/use_case/create_property";
import type { User } from "../../../auth/domain/entity/user";
import {
  HttpControllerMethod,
  type Controller,
  type ControllerRequest,
} from "../../../core/presentation/controller/controller";

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

export class CreatePropertyController implements Controller {
  path = "/property";
  method = HttpControllerMethod.POST;
  inputSchema = inputSchema;

  constructor(private readonly useCase: CreatePropertyUseCase) {}

  async handle(request: ControllerRequest, user: User) {
    const input = request.body as Input;

    const output = await this.useCase.execute({
      name: input.name,
      user_id: user.id,
      address: input.address,
      images: input.images,
      capacity: input.capacity,
    });

    return output;
  }
}
