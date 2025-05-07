
import { env } from './env';
import { toast } from "sonner";

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
  
  try {
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
        const errorMsg = data.message || 'API Error';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      return data as T;
    }
    
    // Handle success for non-JSON responses
    if (!response.ok) {
      const errorMsg = 'API Error';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    return undefined as unknown as T;
  } catch (error) {
    // If API server is not available, use localStorage as fallback
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('API server not available. Using localStorage fallback.');
      return handleLocalStorageFallback<T>(endpoint, options);
    }
    throw error;
  }
}

/**
 * Fallback to localStorage when API is not available
 */
function handleLocalStorageFallback<T>(endpoint: string, options: ApiRequestOptions): T {
  const method = options.method?.toUpperCase() || 'GET';
  
  // Extract collection name from the endpoint (e.g., '/projects' -> 'projects')
  const collection = endpoint.split('/').filter(Boolean)[0] || 'default';
  const id = endpoint.split('/').filter(Boolean)[1];
  
  // Handle different HTTP methods
  switch (method) {
    case 'GET': {
      if (id) {
        // Get a single item
        const items = JSON.parse(localStorage.getItem(collection) || '[]');
        const item = items.find((item: any) => item.id === id);
        return item as unknown as T;
      } else {
        // Get all items
        return JSON.parse(localStorage.getItem(collection) || '[]') as unknown as T;
      }
    }
    
    case 'POST': {
      // Create a new item
      const items = JSON.parse(localStorage.getItem(collection) || '[]');
      const body = options.body ? JSON.parse(options.body as string) : {};
      const newItem = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString()
      };
      items.push(newItem);
      localStorage.setItem(collection, JSON.stringify(items));
      return newItem as unknown as T;
    }
    
    case 'PUT': {
      // Update an item
      if (!id) throw new Error('ID is required for PUT requests');
      
      const items = JSON.parse(localStorage.getItem(collection) || '[]');
      const body = options.body ? JSON.parse(options.body as string) : {};
      const index = items.findIndex((item: any) => item.id === id);
      
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...body,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(collection, JSON.stringify(items));
        return items[index] as unknown as T;
      }
      throw new Error(`Item with ID ${id} not found`);
    }
    
    case 'DELETE': {
      // Delete an item
      if (!id) throw new Error('ID is required for DELETE requests');
      
      const items = JSON.parse(localStorage.getItem(collection) || '[]');
      const filtered = items.filter((item: any) => item.id !== id);
      localStorage.setItem(collection, JSON.stringify(filtered));
      return { success: true } as unknown as T;
    }
    
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
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
    
  /**
   * Project-specific API methods that use localStorage fallback when necessary
   */
  projects: {
    getAll: async () => {
      return await api.get<any[]>('/projects');
    },
    
    getById: async (id: string) => {
      return await api.get<any>(`/projects/${id}`);
    },
    
    create: async (projectData: any) => {
      return await api.post<any>('/projects', projectData);
    },
    
    update: async (id: string, projectData: any) => {
      return await api.put<any>(`/projects/${id}`, projectData);
    },
    
    delete: async (id: string) => {
      return await api.delete<any>(`/projects/${id}`);
    }
  }
};
