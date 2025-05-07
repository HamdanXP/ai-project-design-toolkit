
import { env } from './env';

/**
 * API request options
 */
interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Make an API request
 * @param endpoint The API endpoint
 * @param options Request options
 * @returns The API response
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  // Build URL with query parameters
  const url = new URL(endpoint, env.apiUrl);
  
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  // Default headers
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Make the request
  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });
  
  // Handle non-JSON responses
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    // Check for API errors
    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }
    
    return data as T;
  }
  
  // Handle success for non-JSON responses
  if (!response.ok) {
    throw new Error('API Error');
  }
  
  return undefined as unknown as T;
}

/**
 * API client with convenience methods for CRUD operations
 */
export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) => 
    apiRequest<T>(endpoint, { method: 'GET', ...options }),
  
  post: <T>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
  
  put: <T>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    }),
  
  delete: <T>(endpoint: string, options?: ApiRequestOptions) => 
    apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
};
