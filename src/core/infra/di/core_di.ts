import type { Logger } from "../../application/logger/logger";
import { ConsoleLogger } from "../logger/console_logger";

/**
 * Core dependency injection container.
 * Provides core services like logging across the application.
 */
export class CoreDi {
  #logger: Logger;

  constructor() {
    this.#logger = new ConsoleLogger();
  }

  /**
   * Creates and returns a logger instance.
   * @returns Logger instance
   */
  makeLogger(): Logger {
    return this.#logger;
  }
}
