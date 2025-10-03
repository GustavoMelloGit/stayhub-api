import { z } from "zod";

export const bookedPeriodSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

type BookedPeriodData = z.infer<typeof bookedPeriodSchema>;

/**
 * @kind Value Object
 */
export class BookedPeriod {
  readonly #data: BookedPeriodData;

  constructor(data: BookedPeriodData) {
    this.#data = bookedPeriodSchema.parse(data);
    Object.freeze(this);
  }

  get start() {
    return this.#data.start;
  }

  get end() {
    return this.#data.end;
  }
}
