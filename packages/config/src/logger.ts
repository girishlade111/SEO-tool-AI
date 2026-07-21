const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  data?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  const parts: string[] = [base];

  if (entry.requestId) parts.push(`req=${entry.requestId}`);
  if (entry.userId) parts.push(`user=${entry.userId}`);
  if (entry.data) parts.push(`data=${JSON.stringify(entry.data)}`);
  if (entry.error) parts.push(`error=${entry.error.message}`);

  return parts.join(' ');
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('debug')) return;
    const entry: LogEntry = { timestamp: new Date().toISOString(), level: 'debug', message, data };
    console.debug(formatLog(entry));
  },

  info(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('info')) return;
    const entry: LogEntry = { timestamp: new Date().toISOString(), level: 'info', message, data };
    console.info(formatLog(entry));
  },

  warn(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return;
    const entry: LogEntry = { timestamp: new Date().toISOString(), level: 'warn', message, data };
    console.warn(formatLog(entry));
  },

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    if (!shouldLog('error')) return;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data,
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
    };
    console.error(formatLog(entry));
  },

  withContext(requestId?: string, userId?: string) {
    return {
      debug: (msg: string, data?: Record<string, unknown>) => logger.debug(msg, { ...data, requestId, userId }),
      info: (msg: string, data?: Record<string, unknown>) => logger.info(msg, { ...data, requestId, userId }),
      warn: (msg: string, data?: Record<string, unknown>) => logger.warn(msg, { ...data, requestId, userId }),
      error: (msg: string, err?: Error, data?: Record<string, unknown>) => logger.error(msg, err, { ...data, requestId, userId }),
    };
  },
};
