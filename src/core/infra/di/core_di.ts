import type { Logger } from "../../application/logger/logger";
import { ConsoleLogger } from "../logger/console_logger";

export class CoreDi {
  #logger: Logger;

  constructor() {
    this.#logger = new ConsoleLogger();
  }

  makeLogger(): Logger {
    return this.#logger;
  }
}
