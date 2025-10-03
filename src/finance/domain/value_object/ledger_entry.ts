import z from "zod";

export const ledgerEntrySchema = z.object({
  amount: z.int(),
  description: z.string().nullable(),
  category: z.string(),
  transaction_date: z.coerce.date(),
});

/**
 * @kind Value Object
 */
export class LedgerEntry {
  private readonly data: z.infer<typeof ledgerEntrySchema>;

  constructor(data: z.infer<typeof ledgerEntrySchema>) {
    this.data = ledgerEntrySchema.parse(data);
  }

  get amount() {
    return this.data.amount;
  }

  get description() {
    return this.data.description;
  }

  get category() {
    return this.data.category;
  }
}
