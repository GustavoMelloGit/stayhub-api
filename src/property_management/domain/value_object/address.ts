import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  number: z.string().min(1, "Number is required"),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  complement: z.string().default(""),
});

export type AddressData = z.infer<typeof addressSchema>;

/**
 * @kind Value Object
 */
export class Address {
  readonly #street: string;
  readonly #number: string;
  readonly #neighborhood: string;
  readonly #city: string;
  readonly #state: string;
  readonly #zip_code: string;
  readonly #country: string;
  readonly #complement: string;

  private constructor(data: AddressData) {
    const validatedData = addressSchema.parse(data);
    this.#street = validatedData.street;
    this.#number = validatedData.number;
    this.#neighborhood = validatedData.neighborhood;
    this.#city = validatedData.city;
    this.#state = validatedData.state;
    this.#zip_code = validatedData.zip_code;
    this.#country = validatedData.country;
    this.#complement = validatedData.complement;
  }

  public static create(data: AddressData): Address {
    return new Address(data);
  }

  public static reconstitute(data: AddressData): Address {
    return new Address(data);
  }

  get street(): string {
    return this.#street;
  }

  get number(): string {
    return this.#number;
  }

  get neighborhood(): string {
    return this.#neighborhood;
  }

  get city(): string {
    return this.#city;
  }

  get state(): string {
    return this.#state;
  }

  get zip_code(): string {
    return this.#zip_code;
  }

  get country(): string {
    return this.#country;
  }

  get complement(): string {
    return this.#complement;
  }

  get data(): AddressData {
    return {
      street: this.#street,
      number: this.#number,
      neighborhood: this.#neighborhood,
      city: this.#city,
      state: this.#state,
      zip_code: this.#zip_code,
      country: this.#country,
      complement: this.#complement,
    };
  }

  /**
   * Returns the full address as a formatted string
   */
  get fullAddress(): string {
    const parts = [
      `${this.#street}, ${this.#number}`,
      this.#neighborhood,
      this.#city,
      this.#state,
      this.#zip_code,
      this.#country,
    ];

    if (this.#complement) {
      parts[0] += `, ${this.#complement}`;
    }

    return parts.join(", ");
  }

  /**
   * Checks if two addresses are equal
   */
  public equals(other: Address): boolean {
    return (
      this.#street === other.#street &&
      this.#number === other.#number &&
      this.#neighborhood === other.#neighborhood &&
      this.#city === other.#city &&
      this.#state === other.#state &&
      this.#zip_code === other.#zip_code &&
      this.#country === other.#country &&
      this.#complement === other.#complement
    );
  }
}
