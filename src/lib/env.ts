
/**
 * Environment variable utility functions
 * Provides type-safe access to environment variables with fallbacks
 */

/**
 * Get an environment variable with fallback
 * @param key The environment variable key
 * @param fallback Optional fallback value if the environment variable is not set
 * @returns The environment variable value or fallback
 */
export function getEnv(key: string, fallback: string = ''): string {
  return import.meta.env[key] || fallback;
}

/**
 * Required environment variable - will throw an error if not set
 * @param key The environment variable key
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Required environment variable "${key}" is not set`);
  }
  return value;
}

/**
 * Environment variables used in the application
 */
export const env = {
  // API URLs
  apiUrl: getEnv('VITE_API_URL', '/api'),
  
  // External services
  databaseUrl: getEnv('VITE_DATABASE_URL'),
  
  // Feature flags
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};
