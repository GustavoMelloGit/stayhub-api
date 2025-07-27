import { z } from 'zod';
import { ValidationError } from '../../../application/error/validation_error';
import { CreateTenantUseCase } from '../../../application/use_case/tenant/create_tenant';
import type { Controller, ControllerRequest } from '../controller';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().length(13),
});

type Input = z.infer<typeof schema>;

export class CreateTenantController implements Controller {
  constructor(private readonly useCase: CreateTenantUseCase) {}

  async validate(request: ControllerRequest): Promise<Input | Response> {
    const data = request.body;

    const parsedInput = schema.safeParse(data);

    if (!parsedInput.success) {
      const errors = z.treeifyError(parsedInput.error);
      throw new ValidationError(
        `Validation errors: ${JSON.stringify(errors.errors)}`
      );
    }

    return parsedInput.data;
  }

  async handle(request: Request): Promise<Response> {
    const validationResponse = await this.validate(request);
    if (validationResponse instanceof Response) {
      return validationResponse;
    }

    const output = await this.useCase.execute(validationResponse);

    return {
      message: 'Tenant created successfully',
      data: output,
    };
  }
}
