import { UseCase, Dataset, ScopingCompletionData, mapDatasetToBackend, mapUseCaseToBackend } from '@/types/scoping-phase';
import { api } from './api';
import { logger } from './logger';

// API Response Types
export interface ScopingApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Enhanced API types to match new humanitarian-focused backend response
export interface ApiUseCase {
  id: string;
  title: string;
  description: string;
  source: string;
  source_url: string;
  type: 'academic_paper' | 'humanitarian_report' | 'case_study' | 'ai_application' | 'use_case_repository' | 'curated_template';
  category: string;
  
  // Core educational content
  how_it_works: string;
  real_world_impact: string;
  
  // NEW: Humanitarian-focused educational content
  similarity_to_project?: string;
  real_world_examples?: string;
  implementation_approach?: string;
  decision_guidance?: string;
  
  // Enhanced practical information
  key_success_factors?: string[];
  resource_requirements?: string[];
  challenges?: string[];
  
  // Optional metadata based on source type
  authors?: string[];
  published_date?: string;
  organization?: string;
  date?: string;
  venue?: string;
  citation_count?: number;
}

export interface ApiDataset {
  name: string;
  source: string;
  url: string;
  description: string;
  data_types: string[];
  ethical_concerns: string[];
  suitability_score: number;
  last_modified?: string;
  size?: string;
  license?: string;
  num_resources?: number;
}

export interface DataSuitabilityRequest {
  data_completeness: 'looks_clean' | 'some_issues' | 'many_problems';
  population_representativeness: 'representative' | 'partially' | 'limited_coverage';
  privacy_ethics: 'privacy_safe' | 'need_review' | 'high_risk';
  quality_sufficiency: 'sufficient' | 'borderline' | 'insufficient';
}

// Updated final feasibility request structure with correct terminology
export interface FinalFeasibilityRequest {
  selected_use_case?: {
    id: string;
    title: string;
    description: string;
    category: string;
    complexity: string;
    source_url?: string;
    similarity_score?: number;
    tags: string[];
  };
  selected_dataset?: {
    name: string;
    source: string;
    url?: string;
    description: string;
    size_estimate?: string;
    data_types: string[];
    ethical_concerns: string[];
    suitability_score?: number;
  };
  feasibility_summary: {
    overall_percentage: number;
    feasibility_level: 'high' | 'medium' | 'low';
    key_constraints: string[];
  };
  data_suitability: {
    percentage: number;
    suitability_level: string;
  };
  constraints: Array<{id: string; label: string; value: string | boolean; type: string}>;
  suitability_checks: Array<{id: string; question: string; answer: string; description: string}>;
  active_step: number;
  ready_to_proceed: boolean;
  reasoning?: string;
}

// Enhanced conversion function with new humanitarian-focused fields
export const convertApiUseCase = (apiUseCase: ApiUseCase): UseCase => {
  try {
    // Create more meaningful tags from available metadata
    const tags = [];
    
    // Add category if available
    if (apiUseCase.category && apiUseCase.category !== 'General') {
      tags.push(apiUseCase.category);
    }
    
    // Add meaningful domain tags based on description/title content
    const contentText = `${apiUseCase.title} ${apiUseCase.description}`.toLowerCase();
    
    // Domain-specific tags
    if (contentText.includes('health') || contentText.includes('medical') || contentText.includes('disease')) {
      tags.push('Health');
    }
    if (contentText.includes('crop') || contentText.includes('agriculture') || contentText.includes('farming') || contentText.includes('food')) {
      tags.push('Agriculture');
    }
    if (contentText.includes('water') || contentText.includes('sanitation')) {
      tags.push('Water & Sanitation');
    }
    if (contentText.includes('disaster') || contentText.includes('emergency')) {
      tags.push('Disaster Response');
    }
    if (contentText.includes('education') || contentText.includes('learning')) {
      tags.push('Education');
    }
    
    // AI technique tags
    if (contentText.includes('prediction') || contentText.includes('forecast')) {
      tags.push('Prediction');
    }
    if (contentText.includes('classification') || contentText.includes('detection')) {
      tags.push('Classification');
    }
    if (contentText.includes('optimization')) {
      tags.push('Optimization');
    }
    if (contentText.includes('monitoring') || contentText.includes('surveillance')) {
      tags.push('Monitoring');
    }

    // Format source URL properly
    let formattedSourceUrl = apiUseCase.source_url || '';
    
    // Handle different URL formats
    if (formattedSourceUrl) {
      if (formattedSourceUrl.startsWith('gs://')) {
        formattedSourceUrl = `https://storage.googleapis.com/${formattedSourceUrl.slice(5)}`;
      }
      
      if (formattedSourceUrl && !formattedSourceUrl.startsWith('http://') && !formattedSourceUrl.startsWith('https://')) {
        formattedSourceUrl = 'https://' + formattedSourceUrl;
      }
    }

    return {
      id: apiUseCase.id,
      title: apiUseCase.title || 'Untitled Use Case',
      description: apiUseCase.description || 'No description available',
      tags: [...new Set(tags)].filter(Boolean).slice(0, 4),
      selected: false,
      
      // Backend aligned fields
      category: apiUseCase.category || 'General',
      complexity: 'medium', // Default complexity
      source_url: formattedSourceUrl,
      
      // Pass through all additional fields
      source: apiUseCase.source,
      type: apiUseCase.type,
      
      // Core educational content
      how_it_works: apiUseCase.how_it_works,
      real_world_impact: apiUseCase.real_world_impact,
      
      // NEW: Humanitarian-focused educational content
      similarity_to_project: apiUseCase.similarity_to_project,
      real_world_examples: apiUseCase.real_world_examples,
      implementation_approach: apiUseCase.implementation_approach,
      decision_guidance: apiUseCase.decision_guidance,
      
      // Enhanced practical information
      key_success_factors: apiUseCase.key_success_factors,
      resource_requirements: apiUseCase.resource_requirements,
      challenges: apiUseCase.challenges,
      
      // Optional metadata
      authors: apiUseCase.authors,
      published_date: apiUseCase.published_date,
      organization: apiUseCase.organization,
      date: apiUseCase.date,
      venue: apiUseCase.venue,
      citation_count: apiUseCase.citation_count
    };
  } catch (error) {
    console.error('Error converting API use case:', error);
    // Return a safe fallback
    return {
      id: apiUseCase.id || `fallback_${Date.now()}`,
      title: apiUseCase.title || 'Use Case',
      description: apiUseCase.description || 'Description not available',
      tags: ['General'],
      selected: false,
      category: apiUseCase.category || 'General',
      source_url: apiUseCase.source_url || '',
      source: apiUseCase.source || 'Unknown',
      
      // Provide fallback values for required fields
      how_it_works: apiUseCase.how_it_works || 'Technical details not available',
      real_world_impact: apiUseCase.real_world_impact || 'Impact details not available',
      key_success_factors: apiUseCase.key_success_factors || ['Details not available'],
      challenges: apiUseCase.challenges || ['Not specified'],
      type: apiUseCase.type || 'ai_application'
    };
  }
};

// Convert API dataset with enhanced information
export const convertApiDataset = (apiDataset: ApiDataset): Dataset => {
  return {
    // Backend aligned fields
    name: apiDataset.name,
    source: apiDataset.url || apiDataset.source, // Use URL as source for the "View Source" functionality
    url: apiDataset.url,
    description: apiDataset.description,
    size_estimate: apiDataset.size || "Unknown",
    data_types: apiDataset.data_types || [],
    ethical_concerns: apiDataset.ethical_concerns || [],
    suitability_score: apiDataset.suitability_score,
    
    // Frontend convenience fields
    id: apiDataset.name.toLowerCase().replace(/\s+/g, '_'),
    title: apiDataset.name,
    format: "Various", 
    size: apiDataset.size || "Unknown",
    license: apiDataset.license || "Various",
    
    // Additional fields
    last_modified: apiDataset.last_modified,
    num_resources: apiDataset.num_resources,
    
    // Legacy fields (empty for backwards compatibility)
    columns: [],
    sampleRows: []
  };
};

export const scopingApi = {
  // 1. Get Use Cases with enhanced humanitarian-focused educational content
  getUseCases: async (projectId: string): Promise<ApiUseCase[]> => {
    try {
      logger.log(`Fetching AI use cases with humanitarian-focused guidance for project: ${projectId}`);
      
      const response = await api.get<ScopingApiResponse<ApiUseCase[]>>(
        `scoping/${projectId}/use-cases`
      );
      
      if (response.success && Array.isArray(response.data)) {
        logger.log(`Successfully fetched ${response.data.length} AI use cases with educational content`);
        return response.data;
      } else {
        logger.warn('Invalid API response format:', response);
        throw new Error('Invalid response format from API');
      }
      
    } catch (error) {
      logger.error('API failed to get use cases:', error);
      return [];
    }
  },

  // 2. Get Recommended Datasets - Enhanced with better error handling
  getRecommendedDatasets: async (
    projectId: string, 
    useCaseId: string, 
    useCaseTitle?: string, 
    useCaseDescription?: string
  ): Promise<ApiDataset[]> => {
    try {
      logger.log(`Fetching datasets for project: ${projectId}, use case: ${useCaseTitle}`);
      
      const response = await api.post<ScopingApiResponse<ApiDataset[]>>(`scoping/${projectId}/datasets`, {
        use_case_id: useCaseId,
        use_case_title: useCaseTitle,
        use_case_description: useCaseDescription
      });
      
      if (response.success) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          logger.log(`Successfully fetched ${response.data.length} datasets from humanitarian sources`);
          return response.data;
        } else {
          logger.log('No datasets found from humanitarian sources');
          return [];
        }
      } else {
        logger.warn('Dataset API returned success=false:', response.message);
        return [];
      }
    } catch (error) {
      logger.error('API failed to get datasets:', error);
      return [];
    }
  },

  // 3. NEW: Complete Scoping Phase
  completeScopingPhase: async (
    projectId: string,
    scopingData: ScopingCompletionData
  ): Promise<ScopingApiResponse<any>> => {
    try {
      logger.log(`Completing scoping phase for project: ${projectId}`);
      
      // Map frontend data to backend format
      const requestData: FinalFeasibilityRequest = {
        selected_use_case: scopingData.selected_use_case ? mapUseCaseToBackend(scopingData.selected_use_case) : undefined,
        selected_dataset: scopingData.selected_dataset ? mapDatasetToBackend(scopingData.selected_dataset) : undefined,
        feasibility_summary: scopingData.feasibility_summary,
        data_suitability: scopingData.data_suitability,
        constraints: scopingData.constraints,
        suitability_checks: scopingData.suitability_checks,
        active_step: scopingData.active_step,
        ready_to_proceed: scopingData.ready_to_proceed,
        reasoning: scopingData.reasoning
      };
      
      const response = await api.post<ScopingApiResponse<any>>(
        `scoping/${projectId}/complete`,
        requestData
      );
      
      if (response.success) {
        logger.log('Successfully completed scoping phase');
        return response;
      } else {
        logger.error('Scoping completion failed:', response.message);
        throw new Error(response.message || 'Failed to complete scoping phase');
      }
      
    } catch (error) {
      logger.error('API failed to complete scoping phase:', error);
      throw error;
    }
  }
};