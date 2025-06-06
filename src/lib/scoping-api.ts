
import { api } from './api';

// Types for API responses
export interface ApiUseCase {
  id: string;
  title: string;
  description: string;
  source: string;
  source_url: string;
  type: 'academic_paper' | 'humanitarian_report';
  category: string;
  complexity: 'low' | 'medium' | 'high';
  data_completeness: 'low' | 'medium' | 'high';
  how_it_works: string;
  technical_requirements: string[];
  timeline: string;
  success_factors: string[];
  challenges: string[];
  ethical_considerations: string[];
  recommended_for: string[];
  suitability_score: number;
  authors?: string[];
  organization?: string;
  published_date?: string;
  date?: string;
}

export interface ApiDataset {
  name: string;
  source: string;
  url: string;
  description: string;
  data_types: string[];
  ethical_concerns: string[];
  suitability_score: number;
}

export interface FeasibilityAnalysisRequest {
  project_budget: string;
  project_timeline: string;
  team_size: string;
  computing_resources: string;
  reliable_internet_connection: boolean;
  local_technology_setup: boolean;
  ai_ml_experience: string;
  technical_skills: string;
  learning_training_capacity: boolean;
  stakeholder_buy_in: string;
  change_management_readiness: boolean;
  data_governance: string;
  regulatory_requirements: string;
  external_partnerships: boolean;
  long_term_sustainability_plan: boolean;
}

export interface FeasibilityAnalysisResponse {
  overall_feasibility_score: number;
  overall_percentage: number;
  feasibility_level: string;
  summary: string;
  category_scores: Record<string, {
    score: number;
    label: string;
    percentage: number;
  }>;
  risk_mitigation_strategies: Array<{
    risk_level: string;
    title: string;
    description: string;
    practical_examples: string[];
    color: string;
  }>;
  next_steps: string[];
}

export interface DataSuitabilityRequest {
  data_completeness: 'looks_clean' | 'some_issues' | 'many_problems';
  population_representativeness: 'representative' | 'partially' | 'limited_coverage';
  privacy_ethics: 'privacy_safe' | 'need_review' | 'high_risk';
  quality_sufficiency: 'sufficient' | 'borderline' | 'insufficient';
}

export interface DataSuitabilityResponse {
  overall_score: number;
  percentage: number;
  suitability_level: string;
  component_scores: Record<string, number>;
  summary: string;
  recommendations: string[];
  assessment_responses: DataSuitabilityRequest;
}

export interface FinalFeasibilityRequest {
  selected_use_case: {
    id: string;
    title: string;
    description: string;
    category: string;
    complexity: string;
  };
  selected_dataset: {
    name: string;
    source: string;
    format: string;
    size: string;
    license: string;
  };
  feasibility_summary: {
    overall_percentage: number;
    feasibility_level: string;
    key_constraints: string[];
  };
  data_suitability: {
    percentage: number;
    suitability_level: string;
  };
  ready_to_proceed: boolean;
  reasoning: string;
}

export interface FinalFeasibilityResponse {
  final_summary: {
    overall_readiness_score: number;
    feasibility_score: number;
    data_suitability_score: number;
    ready_to_proceed: boolean;
    key_constraints: string[];
    summary: string;
    recommendation: string;
    next_phase: string;
  };
  ready_to_proceed: boolean;
  next_phase: string;
}

// API service functions
export const scopingApi = {
  getUseCases: async (projectId: string): Promise<ApiUseCase[]> => {
    const response = await api.get<{ success: boolean; data: ApiUseCase[] }>(`/scoping/${projectId}/use-cases`);
    return response.data;
  },

  getRecommendedDatasets: async (projectId: string, useCaseId: string): Promise<ApiDataset[]> => {
    const response = await api.post<{ success: boolean; data: ApiDataset[] }>(`/scoping/${projectId}/datasets`, {
      use_case_id: useCaseId
    });
    return response.data;
  },

  analyzeFeasibility: async (projectId: string, constraints: FeasibilityAnalysisRequest): Promise<FeasibilityAnalysisResponse> => {
    const response = await api.post<{ success: boolean; data: FeasibilityAnalysisResponse }>(`/scoping/${projectId}/feasibility-analysis`, constraints);
    return response.data;
  },

  getDataAssessmentGuidance: async (projectId: string) => {
    const response = await api.get(`/scoping/${projectId}/data-assessment-guidance`);
    return response.data;
  },

  analyzeDataFile: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/scoping/${projectId}/analyze-data-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  assessDataSuitability: async (projectId: string, assessment: DataSuitabilityRequest): Promise<DataSuitabilityResponse> => {
    const response = await api.post<{ success: boolean; data: DataSuitabilityResponse }>(`/scoping/${projectId}/assess-data-suitability`, assessment);
    return response.data;
  },

  finalFeasibilityGate: async (projectId: string, request: FinalFeasibilityRequest): Promise<FinalFeasibilityResponse> => {
    const response = await api.post<{ success: boolean; data: FinalFeasibilityResponse }>(`/scoping/${projectId}/final-feasibility-gate`, request);
    return response.data;
  }
};
