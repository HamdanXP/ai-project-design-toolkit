import { api } from './api';
import { downloadFileFromContent, createZipDownload, getDownloadInfo, processDownloadResponse } from './download-utils';

import {
  AISolution,
  ProjectContext,
  DevelopmentPhaseData,
  GeneratedProject,
  ProjectGenerationRequest,
  ProjectGenerationResponse,
  SolutionSelection,
  DevelopmentStatus,
  DevelopmentApiResponse,
  EthicalSafeguard,
  ProjectRecommendation,
  ProjectContextOnly,
  SolutionsData,
  DevelopmentError,
  DevelopmentMetrics,
  CompleteProjectDownloadResponse, 
  SingleFileDownloadResponse,
  DownloadResponse 
} from '@/types/development-phase';

export interface DevelopmentApiError {
  type: 'network' | 'server' | 'validation' | 'not_found' | 'timeout' | 'unknown';
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  suggestedAction?: string;
}

const createDevelopmentError = (error: any, context: string): DevelopmentApiError => {
  if (!error) {
    return {
      type: 'unknown',
      message: 'Unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again.',
      recoverable: true,
      retryable: true,
      suggestedAction: 'Try refreshing the page or contact support if the problem persists'
    };
  }

  const isNetworkError = !navigator.onLine || 
    error.message?.includes('fetch') || 
    error.message?.includes('network') ||
    error.code === 'NETWORK_ERROR';

  const isServerError = error.status >= 500 || error.message?.includes('Internal Server Error');
  const isNotFound = error.status === 404 || error.message?.includes('not found');
  const isValidationError = error.status === 400 || error.message?.includes('validation');
  const isTimeout = error.message?.includes('timeout') || error.code === 'TIMEOUT';

  if (isNetworkError) {
    return {
      type: 'network',
      message: error.message || 'Network connection failed',
      userMessage: 'Connection problem. Check your internet connection.',
      recoverable: true,
      retryable: true,
      suggestedAction: 'Check your internet connection and try again'
    };
  }

  if (isNotFound) {
    return {
      type: 'not_found',
      message: error.message || 'Resource not found',
      userMessage: 'Project not found or no longer available.',
      recoverable: false,
      retryable: false,
      suggestedAction: 'Return to project list and select a valid project'
    };
  }

  if (isValidationError) {
    return {
      type: 'validation',
      message: error.message || 'Invalid request data',
      userMessage: 'Invalid project data. Some information may be missing.',
      recoverable: false,
      retryable: false,
      suggestedAction: 'Complete the previous phases or start a new project'
    };
  }

  if (isTimeout) {
    return {
      type: 'timeout',
      message: error.message || 'Request timed out',
      userMessage: 'The request is taking longer than expected.',
      recoverable: true,
      retryable: true,
      suggestedAction: 'The AI analysis may take time. Please wait and try again'
    };
  }

  if (isServerError) {
    return {
      type: 'server',
      message: error.message || 'Server error',
      userMessage: 'Server is temporarily unavailable.',
      recoverable: true,
      retryable: true,
      suggestedAction: 'Try again in a few moments'
    };
  }

  return {
    type: 'unknown',
    message: error.message || 'Unknown error',
    userMessage: error.message || 'Something went wrong. Please try again.',
    recoverable: true,
    retryable: true,
    suggestedAction: 'Try again or contact support if the problem persists'
  };
};

export const developmentApi = {
  getDevelopmentContext: async (projectId: string): Promise<ProjectContextOnly> => {
    const startTime = performance.now();
    
    try {
      console.log(`Fetching basic development context for project: ${projectId}`);
      
      const response = await api.get<DevelopmentApiResponse<ProjectContextOnly>>(
        `development/${projectId}/context`
      );
      
      if (response.success && response.data) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Successfully fetched basic development context in ${Math.round(duration)}ms`);
        
        trackDevelopmentMetrics({
          project_id: projectId,
          phase: 'context',
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          duration_ms: duration,
          success: true,
          cache_hit: response.metadata?.cache_hit
        });
        
        return response.data;
      } else {
        console.warn('Invalid API response format:', response);
        throw new Error(response.message || 'Invalid response format from API');
      }
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error('API failed to get development context:', error);
      
      trackDevelopmentMetrics({
        project_id: projectId,
        phase: 'context',
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_ms: duration,
        success: false,
        error_type: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const developmentError = createDevelopmentError(error, 'loading project context');
      throw developmentError;
    }
  },

  generateSolutionsWithFeedback: async (projectId: string, requestData?: { feedback?: string }): Promise<SolutionsData> => {
    const startTime = performance.now();
    
    try {
      console.log(`Generating AI solutions for project: ${projectId}${requestData?.feedback ? ' with user feedback' : ''}`);
      
      const response = await api.post<DevelopmentApiResponse<SolutionsData>>(
        `development/${projectId}/solutions`,
        requestData || {}
      );
      
      if (response.success && response.data) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Successfully generated ${response.data.available_solutions.length} AI solutions in ${Math.round(duration)}ms`);
        
        trackDevelopmentMetrics({
          project_id: projectId,
          phase: 'solutions',
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          duration_ms: duration,
          success: true,
          solutions_generated: response.data.available_solutions.length,
          cache_hit: response.metadata?.cache_hit
        });
        
        return response.data;
      } else {
        console.warn('Invalid API response format:', response);
        throw new Error(response.message || 'Failed to generate solutions');
      }
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error('API failed to generate solutions:', error);
      
      trackDevelopmentMetrics({
        project_id: projectId,
        phase: 'solutions',
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_ms: duration,
        success: false,
        error_type: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const developmentError = createDevelopmentError(error, 'generating AI solutions');
      throw developmentError;
    }
  },

  generateSolutions: async (projectId: string): Promise<SolutionsData> => {
    return developmentApi.generateSolutionsWithFeedback(projectId);
  },

  selectSolution: async (
    projectId: string, 
    solutionId: string, 
    solutionTitle: string,
    reasoning?: string
  ): Promise<SolutionSelection> => {
    try {
      console.log(`Selecting solution ${solutionId} for project: ${projectId}`);
      
      const selectionData = {
        solution_id: solutionId,
        solution_title: solutionTitle,
        selected_at: new Date().toISOString(),
        reasoning: reasoning || `Selected ${solutionTitle} as the most suitable AI solution`
      };
      
      const response = await api.post<DevelopmentApiResponse<{ selected_solution: SolutionSelection }>>(
        `development/${projectId}/select-solution`, 
        selectionData
      );
      
      if (response.success) {
        console.log('Successfully selected solution');
        return response.data.selected_solution;
      } else {
        console.error('Solution selection failed:', response.message);
        throw new Error(response.message || 'Failed to select solution');
      }
    } catch (error) {
      console.error('API failed to select solution:', error);
      const developmentError = createDevelopmentError(error, 'selecting AI solution');
      throw developmentError;
    }
  },

  generateProject: async (
    projectId: string,
    generationRequest: ProjectGenerationRequest
  ): Promise<ProjectGenerationResponse> => {
    const startTime = performance.now();
    
    try {
      console.log(`Generating project for ${projectId} with solution ${generationRequest.solution_id}`);
      
      const response = await api.post<DevelopmentApiResponse<ProjectGenerationResponse>>(
        `development/${projectId}/generate`,
        generationRequest
      );
      
      if (response.success && response.data) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Successfully generated project in ${Math.round(duration)}ms`);
        
        trackDevelopmentMetrics({
          project_id: projectId,
          phase: 'generation',
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          duration_ms: duration,
          success: true
        });
        
        return response.data;
      } else {
        console.error('Project generation failed:', response.message);
        throw new Error(response.message || 'Failed to generate project');
      }
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error('API failed to generate project:', error);
      
      trackDevelopmentMetrics({
        project_id: projectId,
        phase: 'generation',
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_ms: duration,
        success: false,
        error_type: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const developmentError = createDevelopmentError(error, 'generating AI prototype');
      throw developmentError;
    }
  },

  downloadProjectFile: async (
    projectId: string,
    fileType: 'complete' | 'documentation' | 'setup' | 'ethical-report' | 'deployment'
  ): Promise<void> => {
    try {
      console.log(`Downloading ${fileType} for project: ${projectId}`);
      
      const response = await api.get<DownloadResponse>(
        `development/${projectId}/download/${fileType}`
      );
      
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from server');
      }
      
      await processDownloadResponse(response, fileType, projectId);
      
    } catch (error) {
      console.error(`Failed to download ${fileType}:`, error);
      
      const developmentError = createDevelopmentError(error, `downloading ${fileType}`);
      throw developmentError;
    }
  },
  
  resetDevelopmentProgress: async (projectId: string): Promise<void> => {
    try {
      console.log(`Resetting development progress for project: ${projectId}`);
      
      const response = await api.post<DevelopmentApiResponse<{ reset: boolean; phase: string }>>(
        `development/${projectId}/reset`
      );
      
      if (response.success) {
        console.log('Successfully reset development progress');
      } else {
        throw new Error(response.message || 'Failed to reset development progress');
      }
      
    } catch (error) {
      console.error('API failed to reset development progress:', error);
      const developmentError = createDevelopmentError(error, 'resetting development progress');
      throw developmentError;
    }
  },

  getDevelopmentStatus: async (projectId: string): Promise<DevelopmentStatus> => {
    try {
      const response = await api.get<DevelopmentApiResponse<DevelopmentStatus>>(
        `development/${projectId}/status`
      );
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get development status');
      }
      
    } catch (error) {
      console.error('API failed to get development status:', error);
      const developmentError = createDevelopmentError(error, 'loading development status');
      throw developmentError;
    }
  }
};

export const createProjectGenerationRequest = (
  solutionId: string,
  ethicalPreferences: string[] = [],
  customizations: Record<string, any> = {}
): ProjectGenerationRequest => {
  return {
    solution_id: solutionId,
    project_requirements: {
      solution_type: solutionId,
      include_documentation: true,
      include_setup_guide: true,
      ethical_protections: true,
      include_production_guidance: true,
      include_handover_documentation: true
    },
    ethical_preferences: ethicalPreferences.length > 0 ? ethicalPreferences : [
      'privacy_protection',
      'bias_prevention', 
      'transparency',
      'user_control'
    ],
    customizations: customizations
  };
};

export const extractContextSummary = (contextData: ProjectContextOnly | DevelopmentPhaseData) => {
  const project_context = contextData.project_context;
  const available_solutions = 'available_solutions' in contextData ? contextData.available_solutions : [];
  
  return {
    projectTitle: project_context.title,
    domain: project_context.problem_domain,
    targetBeneficiaries: project_context.target_beneficiaries,
    recommendedSolutions: available_solutions.filter(s => s.recommended),
    totalSolutions: available_solutions.length,
    hasUseCase: !!project_context.selected_use_case,
    hasTechnicalInfrastructure: !!project_context.technical_infrastructure,
    keyRecommendations: project_context.recommendations.slice(0, 3),
    aiTechniques: available_solutions.map(s => s.ai_technique),
    solutionDiversity: new Set(available_solutions.map(s => s.ai_technique)).size
  };
};

export const analyzeSolutionDiversity = (solutions: AISolution[]): {
  hasMultipleTechniques: boolean;
  techniques: string[];
  diversity_score: number;
  approach_explanation: string;
} => {
  const techniques = solutions.map(s => s.ai_technique);
  const uniqueTechniques = new Set(techniques);
  
  const diversity_score = uniqueTechniques.size / Math.max(solutions.length, 1);
  
  const hasMultipleTechniques = uniqueTechniques.size > 1;
  
  let approach_explanation = '';
  if (uniqueTechniques.size === 1) {
    approach_explanation = `All solutions use ${techniques[0]} as it's the most appropriate technique for this specific problem.`;
  } else if (uniqueTechniques.size === solutions.length) {
    approach_explanation = `Each solution uses a different AI technique to address different aspects of your humanitarian problem.`;
  } else {
    approach_explanation = `Multiple AI techniques were identified as viable for different aspects of this problem.`;
  }
  
  return {
    hasMultipleTechniques,
    techniques: Array.from(uniqueTechniques),
    diversity_score,
    approach_explanation
  };
};

export const validateSolutionQuality = (solutions: AISolution[]): {
  quality_score: number;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let quality_score = 1.0;
  
  if (solutions.length === 0) {
    issues.push("No solutions were generated");
    quality_score = 0;
    return { quality_score, issues, recommendations };
  }
  
  const diversity = analyzeSolutionDiversity(solutions);
  if (!diversity.hasMultipleTechniques && solutions.length > 1) {
    issues.push("All solutions use the same AI technique");
    recommendations.push("Request different AI approaches that address different aspects of the problem");
    quality_score -= 0.3;
  }
  
  const hasBestForField = solutions.every(s => s.best_for && s.best_for.trim().length > 0);
  if (!hasBestForField) {
    issues.push("Some solutions lack clear use case alignment");
    quality_score -= 0.2;
  }
  
  const hasRecommended = solutions.some(s => s.recommended);
  if (!hasRecommended) {
    issues.push("No recommended solution identified");
    recommendations.push("Look for the solution that best matches your primary use case");
    quality_score -= 0.1;
  }
  
  const averageConfidence = solutions.reduce((sum, s) => sum + s.confidence_score, 0) / solutions.length;
  if (averageConfidence < 60) {
    issues.push("Low confidence in generated solutions");
    recommendations.push("Provide more specific context about your problem and requirements");
    quality_score -= 0.2;
  }
  
  return {
    quality_score: Math.max(0, quality_score),
    issues,
    recommendations
  };
};

const trackDevelopmentMetrics = (metrics: Omit<DevelopmentMetrics, 'user_agent' | 'browser_performance'>) => {
  try {
    const developmentMetrics: DevelopmentMetrics = {
      ...metrics,
      user_agent: navigator.userAgent,
      browser_performance: {
        memory_used_mb: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || undefined,
        cpu_usage_percent: undefined
      }
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Development Metrics:', developmentMetrics);
    }
    
  } catch (error) {
    console.warn('Failed to track development metrics:', error);
  }
};