
import { env } from '@/lib/env';

/**
 * Application configuration
 */
export const appConfig = {
  // Application name and details
  name: 'AI Project Builder',
  description: 'Build and manage AI-powered projects',
  version: '1.0.0',
  
  // External services
  api: {
    baseUrl: env.apiUrl,
    timeout: 30000, // 30 seconds
  },
  
  // Feature flags
  features: {
    enableRealDatabase: !!env.databaseUrl,
    isProduction: env.isProduction,
    isDevelopment: env.isDevelopment,
  },
  
  // Toast notification settings
  toast: {
    duration: 3000, // 3 seconds
  }
};
