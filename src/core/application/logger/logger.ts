/**
 * Logger interface for application-wide logging functionality.
 * Provides structured logging with different levels and context support.
 */
export interface Logger {
  /**
   * Logs debug level messages.
   * @param message - The message to log
   * @param context - Optional context object for additional information
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs info level messages.
   * @param message - The message to log
   * @param context - Optional context object for additional information
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs warning level messages.
   * @param message - The message to log
   * @param context - Optional context object for additional information
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs error level messages.
   * @param message - The message to log
   * @param context - Optional context object for additional information
   */
  error(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs fatal level messages.
   * @param message - The message to log
   * @param context - Optional context object for additional information
   */
  fatal(message: string, context?: Record<string, unknown>): void;
}
