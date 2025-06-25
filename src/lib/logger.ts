import { env } from './env';

export const logger = {
  log: (...args: unknown[]) => {
    if (env.isDevelopment) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (env.isDevelopment) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (env.isDevelopment) console.error(...args);
  }
};
