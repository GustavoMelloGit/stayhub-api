import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GetStayUseCase } from '../../../application/use_case/stay/get_stay';
import type { Controller, ControllerRequest } from '../controller';

const inputSchema = z.object({
  stay_id: z.string(),
});

type Input = z.infer<typeof inputSchema>;

export class GetStayController implements Controller {
  constructor(private readonly useCase: GetStayUseCase) {}

  async validate(request: ControllerRequest): Promise<Response | Input> {
    const parsedInput = inputSchema.safeParse(request.params);

    if (!parsedInput.success) {
      const errors = parsedInput.error.flatten();
      return NextResponse.json({ error: errors.fieldErrors }, { status: 422 });
    }

    return parsedInput.data;
  }

  async handle(request: ControllerRequest): Promise<Response> {
    const validationResponse = await this.validate(request);
    if (validationResponse instanceof Response) {
      return validationResponse;
    }

    const output = await this.useCase.execute({
      stay_id: validationResponse.stay_id,
    });

    return NextResponse.json(output, { status: 200 });
  }
}
