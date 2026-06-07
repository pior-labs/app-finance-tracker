import type { env } from './env.js';

type LogLevel = typeof env.logLevel;
type LogContext = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export function createLogger(minimumLevel: LogLevel) {
  function write(level: LogLevel, message: string, context: LogContext = {}) {
    if (levelPriority[level] < levelPriority[minimumLevel]) {
      return;
    }

    process.stderr.write(
      `${JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...context
      })}\n`
    );
  }

  return {
    debug: (message: string, context?: LogContext) => write('debug', message, context),
    info: (message: string, context?: LogContext) => write('info', message, context),
    warn: (message: string, context?: LogContext) => write('warn', message, context),
    error: (message: string, context?: LogContext) => write('error', message, context)
  };
}
