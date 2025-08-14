import type { Tenant } from "./tenant";

type Input = {
  check_in: Date;
  check_out: Date;
  tenant: Tenant;
  guests: number;
  id: string;
  password: string;
};

export class Stay {
  #check_in: Date;
  #check_out: Date;
  #tenant: Tenant;
  #guests: number;
  #id: string;
  #password: string;

  constructor(input: Input) {
    this.#check_in = input.check_in;
    this.#check_out = input.check_out;
    this.#tenant = input.tenant;
    this.#guests = input.guests;
    this.#id = input.id;
    this.#password = input.password;
  }

  get check_in() {
    return this.#check_in;
  }

  get check_out() {
    return this.#check_out;
  }

  get tenant() {
    return this.#tenant;
  }

  get guests() {
    return this.#guests;
  }

  get id() {
    return this.#id;
  }

  get password() {
    return this.#password;
  }
}
