
import { env } from './env';
import { toast } from "sonner";
import { ProjectPhase } from "@/types/project";

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
  // Use the backend base URL
  const baseUrl = 'http://localhost:8000/api/v1';
  const url = new URL(endpoint, baseUrl);
  
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
 * Backend API response types
 */
export interface BackendProject {
  id: string;
  title: string;
  description: string;
  status: string;
  current_phase: string;
  created_at: string;
  updated_at: string;
}

export interface BackendApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ReflectionQuestions {
  problem_definition: string;
  target_beneficiaries: string;
  potential_harm: string;
  data_availability: string;
  resource_constraints: string;
  success_metrics: string;
  stakeholder_involvement: string;
  cultural_sensitivity: string;
}

export interface ReflectionAnswers {
  problem_definition: string;
  target_beneficiaries: string;
  potential_harm: string;
  data_availability: string;
  resource_constraints: string;
  success_metrics: string;
  stakeholder_involvement: string;
  cultural_sensitivity: string;
}

export interface ReflectionAnalysis {
  answers: ReflectionAnswers;
  ai_analysis: string;
  ethical_score: number;
  proceed_recommendation: boolean;
  concerns: string[];
}

/**
 * Type definitions for legacy API responses (for fallback compatibility)
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  tags: string[];
  phases: ProjectPhase[];
  prompt?: string;
  files?: string[];
}

export interface ProjectSuggestion {
  title: string;
  prompt: string;
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
   * Backend API methods
   */
  backend: {
    projects: {
      create: async (description: string): Promise<BackendApiResponse<BackendProject>> => {
        return await api.post<BackendApiResponse<BackendProject>>('/projects/', { description });
      },
      
      getById: async (projectId: string): Promise<BackendApiResponse<BackendProject>> => {
        return await api.get<BackendApiResponse<BackendProject>>(`/projects/${projectId}`);
      },
      
      list: async (skip = 0, limit = 10, status?: string): Promise<BackendApiResponse<BackendProject[]>> => {
        const params: Record<string, string> = {
          skip: skip.toString(),
          limit: limit.toString()
        };
        if (status) params.status = status;
        
        return await api.get<BackendApiResponse<BackendProject[]>>('/projects/', { params });
      }
    },
    
    reflection: {
      getQuestions: async (projectId: string): Promise<BackendApiResponse<ReflectionQuestions>> => {
        return await api.get<BackendApiResponse<ReflectionQuestions>>(`/reflection/${projectId}/questions`);
      },
      
      submitAnswers: async (projectId: string, answers: ReflectionAnswers): Promise<BackendApiResponse<ReflectionAnalysis>> => {
        return await api.post<BackendApiResponse<ReflectionAnalysis>>(`/reflection/${projectId}/submit`, answers);
      }
    }
  },
    
  /**
   * Legacy project methods (for fallback compatibility)
   */
  projects: {
    getAll: async (): Promise<Project[]> => {
      return await api.get<Project[]>('/projects');
    },
    
    getById: async (id: string): Promise<Project> => {
      return await api.get<Project>(`/projects/${id}`);
    },
    
    create: async (projectData: Partial<Project>): Promise<Project> => {
      return await api.post<Project>('/projects', projectData);
    },
    
    update: async (id: string, projectData: Partial<Project>): Promise<Project> => {
      return await api.put<Project>(`/projects/${id}`, projectData);
    },
    
    delete: async (id: string): Promise<{success: boolean}> => {
      return await api.delete<{success: boolean}>(`/projects/${id}`);
    },

    getSuggestions: async (): Promise<ProjectSuggestion[]> => {
      return await api.get<ProjectSuggestion[]>('/project-suggestions');
    },

    completePhase: async (projectId: string, phaseId: string): Promise<Project> => {
      return await api.post<Project>(`/projects/${projectId}/phases/${phaseId}/complete`);
    },

    updatePhaseProgress: async (projectId: string, phaseId: string, progress: number): Promise<Project> => {
      return await api.put<Project>(`/projects/${projectId}/phases/${phaseId}/progress`, { progress });
    },

    updatePhaseStatus: async (projectId: string, phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number): Promise<Project> => {
      return await api.put<Project>(`/projects/${projectId}/phases/${phaseId}/status`, { 
        status, 
        progress 
      });
    },

    completeProject: async (projectId: string): Promise<Project> => {
      return await api.post<Project>(`/projects/${projectId}/complete`);
    }
  }
};
