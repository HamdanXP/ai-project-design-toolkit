import { toast } from "sonner";
import { EthicalConsideration, ProjectPhase } from "@/types/project";
import { TechnicalInfrastructure, InfrastructureAssessment } from "@/types/scoping-phase";
import { API_BASE_URL } from "@/config";

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const baseUrl = API_BASE_URL;
  const url = new URL(endpoint, baseUrl);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || "API Error";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      return data as T;
    }

    if (!response.ok) {
      const errorMsg = "API Error";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return undefined as unknown as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn("API server not available. Using localStorage fallback.");
      return handleLocalStorageFallback<T>(endpoint, options);
    }
    throw error;
  }
}

function handleLocalStorageFallback<T>(
  endpoint: string,
  options: ApiRequestOptions
): T {
  const method = options.method?.toUpperCase() || "GET";

  const collection = endpoint.split("/").filter(Boolean)[0] || "default";
  const id = endpoint.split("/").filter(Boolean)[1];

  switch (method) {
    case "GET": {
      if (id) {
        const items = JSON.parse(localStorage.getItem(collection) || "[]");
        const item = items.find((item: any) => item.id === id);
        return item as unknown as T;
      } else {
        return JSON.parse(
          localStorage.getItem(collection) || "[]"
        ) as unknown as T;
      }
    }

    case "POST": {
      const items = JSON.parse(localStorage.getItem(collection) || "[]");
      const body = options.body ? JSON.parse(options.body as string) : {};
      const newItem = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
      };
      items.push(newItem);
      localStorage.setItem(collection, JSON.stringify(items));
      return newItem as unknown as T;
    }

    case "PUT": {
      if (!id) throw new Error("ID is required for PUT requests");

      const items = JSON.parse(localStorage.getItem(collection) || "[]");
      const body = options.body ? JSON.parse(options.body as string) : {};
      const index = items.findIndex((item: any) => item.id === id);

      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...body,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(collection, JSON.stringify(items));
        return items[index] as unknown as T;
      }
      throw new Error(`Item with ID ${id} not found`);
    }

    case "DELETE": {
      if (!id) throw new Error("ID is required for DELETE requests");

      const items = JSON.parse(localStorage.getItem(collection) || "[]");
      const filtered = items.filter((item: any) => item.id !== id);
      localStorage.setItem(collection, JSON.stringify(filtered));
      return { success: true } as unknown as T;
    }

    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

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
  [key: string]: string;
}

export interface ReflectionAnswers {
  [key: string]: string;
}
export interface ReflectionAnalysis {
  answers: ReflectionAnswers;
  ai_analysis: string;
  ethical_score: number;
  proceed_recommendation: boolean;
  concerns: string[];
}

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

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { method: "GET", ...options }),

  post: <T>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { method: "DELETE", ...options }),

  backend: {
    projects: {
      create: async (
        description: string
      ): Promise<BackendApiResponse<BackendProject>> => {
        return await api.post<BackendApiResponse<BackendProject>>("projects/", {
          description,
        });
      },

      getById: async (
        projectId: string
      ): Promise<BackendApiResponse<BackendProject>> => {
        return await api.get<BackendApiResponse<BackendProject>>(
          `projects/${projectId}`
        );
      },

      list: async (
        skip = 0,
        limit = 10,
        status?: string
      ): Promise<BackendApiResponse<BackendProject[]>> => {
        const params: Record<string, string> = {
          skip: skip.toString(),
          limit: limit.toString(),
        };
        if (status) params.status = status;

        return await api.get<BackendApiResponse<BackendProject[]>>(
          "projects/",
          { params }
        );
      },
      getProjectSync: async (projectId: string) => {
        const response = await fetch(`/api/v1/projects/${projectId}/sync`);
        return response.json();
      },
    },
    reflection: {
      getQuestions: async (
        projectId: string,
        includeGuidance: boolean = true
      ): Promise<BackendApiResponse<any>> => {
        const params: Record<string, string> = {};
        if (includeGuidance) {
          params.include_guidance = "true";
        }

        return await api.get<BackendApiResponse<any>>(
          `reflection/${projectId}/questions`,
          { params }
        );
      },

      completePhase: async (
        projectId: string,
        answers: Record<string, string>
      ): Promise<BackendApiResponse<any>> => {
        return await api.post<BackendApiResponse<any>>(
          `reflection/${projectId}/complete`,
          answers
        );
      },

      advancePhase: async (
        projectId: string
      ): Promise<BackendApiResponse<any>> => {
        return await api.post<BackendApiResponse<any>>(
          `reflection/${projectId}/advance`
        );
      },
    },

    scoping: {
      assessInfrastructure: async (
        projectId: string,
        infrastructure: TechnicalInfrastructure
      ): Promise<BackendApiResponse<InfrastructureAssessment>> => {
        return await api.post<BackendApiResponse<InfrastructureAssessment>>(
          `scoping/${projectId}/assess-infrastructure`,
          infrastructure
        );
      },

      getUseCases: async (
        projectId: string,
        technicalInfrastructure?: TechnicalInfrastructure
      ): Promise<BackendApiResponse<any[]>> => {
        const requestBody = technicalInfrastructure ? { technical_infrastructure: technicalInfrastructure } : {};
        return await api.post<BackendApiResponse<any[]>>(
          `scoping/${projectId}/use-cases`,
          requestBody
        );
      },

      getDatasets: async (
        projectId: string,
        useCaseData: any
      ): Promise<BackendApiResponse<any[]>> => {
        return await api.post<BackendApiResponse<any[]>>(
          `scoping/${projectId}/datasets`,
          useCaseData
        );
      },

      complete: async (
        projectId: string,
        scopingData: any
      ): Promise<BackendApiResponse<any>> => {
        return await api.post<BackendApiResponse<any>>(
          `scoping/${projectId}/complete`,
          scopingData
        );
      },
    },

    ethicalConsiderations: {
      get: async (
        projectId: string
      ): Promise<BackendApiResponse<EthicalConsideration[]>> => {
        return await api.get<BackendApiResponse<EthicalConsideration[]>>(
          `ethical-considerations/${projectId}`
        );
      },

      acknowledge: async (
        projectId: string,
        acknowledgedConsiderations?: string[]
      ): Promise<BackendApiResponse<{ acknowledged: boolean }>> => {
        return await api.post<BackendApiResponse<{ acknowledged: boolean }>>(
          `ethical-considerations/${projectId}/acknowledge`,
          { acknowledged_considerations: acknowledgedConsiderations }
        );
      },

      refresh: async (
        projectId: string
      ): Promise<BackendApiResponse<EthicalConsideration[]>> => {
        return await api.post<BackendApiResponse<EthicalConsideration[]>>(
          `ethical-considerations/${projectId}/refresh`
        );
      },
    },
  },

  projects: {
    getAll: async (): Promise<Project[]> => {
      return await api.get<Project[]>("projects");
    },

    getById: async (id: string): Promise<Project> => {
      return await api.get<Project>(`projects/${id}`);
    },

    create: async (projectData: Partial<Project>): Promise<Project> => {
      return await api.post<Project>("projects", projectData);
    },

    update: async (
      id: string,
      projectData: Partial<Project>
    ): Promise<Project> => {
      return await api.put<Project>(`projects/${id}`, projectData);
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return await api.delete<{ success: boolean }>(`projects/${id}`);
    },

    getSuggestions: async (): Promise<ProjectSuggestion[]> => {
      return await api.get<ProjectSuggestion[]>("project-suggestions");
    },

    updatePhaseProgress: async (
      projectId: string,
      phaseId: string,
      progress: number
    ): Promise<Project> => {
      return await api.put<Project>(
        `projects/${projectId}/phases/${phaseId}/progress`,
        { progress }
      );
    },

    completeProject: async (projectId: string): Promise<Project> => {
      return await api.post<Project>(`projects/${projectId}/complete`);
    },
  },
};