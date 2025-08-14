type Input = {
  id: string;
  name: string;
  phone: string;
};

export class Tenant {
  #id: string;
  #name: string;
  #phone: string;

  constructor(input: Input) {
    this.#id = input.id;
    this.#name = input.name;
    this.#phone = input.phone;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get phone() {
    return this.#phone;
  }
}
