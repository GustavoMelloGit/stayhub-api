import type { Logger } from "../../application/logger/logger";

/**
 * Log levels enum for type safety
 */
enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
}

/**
 * Console-based logger implementation.
 * Provides structured logging with different levels and context support.
 */
export class ConsoleLogger implements Logger {
  private readonly minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  /**
   * Logs debug level messages.
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, context);
  }

  /**
   * Logs info level messages.
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, "INFO", message, context);
  }

  /**
   * Logs warning level messages.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, "WARN", message, context);
  }

  /**
   * Logs error level messages.
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, "ERROR", message, context);
  }

  /**
   * Logs fatal level messages.
   */
  fatal(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, "FATAL", message, context);
  }

  /**
   * Internal logging method that handles the actual output.
   */
  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      ...(context && { context }),
    };

    // Use appropriate console method based on log level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(logEntry, null, 2));
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(logEntry, null, 2));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(logEntry, null, 2));
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(JSON.stringify(logEntry, null, 2));
        break;
    }
  }
}
