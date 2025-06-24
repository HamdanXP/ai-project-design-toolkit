// lib/development-api.ts - Development API with split loading implementation

import { api } from './api';
import { downloadFileFromContent, createZipDownload, getDownloadInfo, processDownloadResponse } from './download-utils';

import {
  // Core types
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
  TechnicalSpecs,
  TechnicalArchitecture,
  
  // Split loading types
  ProjectContextOnly,
  SolutionsData,
  
  // Enhanced types
  DevelopmentLoadingState,
  DevelopmentError,
  DevelopmentMetrics,

  // Download types
  CompleteProjectDownloadResponse, 
  SingleFileDownloadResponse,
  DownloadResponse 
} from '@/types/development-phase';

/**
 * Development API with split loading for improved UX
 * 
 * Split approach:
 * 1. getDevelopmentContext() - Fast context loading (~3s)
 * 2. generateSolutions() - Slow solutions generation (~12s, on-demand)
 */
export const developmentApi = {
  /**
   * Get basic development context (FAST ~3s) - NO solution generation
   * Returns project overview, recommendations, and basic ethical safeguards
   */
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
        
        // Track performance metrics
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
      
      // Track error metrics
      trackDevelopmentMetrics({
        project_id: projectId,
        phase: 'context',
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_ms: duration,
        success: false,
        error_type: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  },

  /**
   * Generate AI solutions (SLOW ~12s) - Called only when user navigates to solutions step
   * Returns 5 tailored AI solutions with full analysis
   */
  generateSolutions: async (projectId: string): Promise<SolutionsData> => {
    const startTime = performance.now();
    
    try {
      console.log(`Generating AI solutions for project: ${projectId}`);
      
      const response = await api.post<DevelopmentApiResponse<SolutionsData>>(
        `development/${projectId}/solutions`
      );
      
      if (response.success && response.data) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`Successfully generated ${response.data.available_solutions.length} AI solutions in ${Math.round(duration)}ms`);
        
        // Track performance metrics
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
      
      // Track error metrics
      trackDevelopmentMetrics({
        project_id: projectId,
        phase: 'solutions',
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_ms: duration,
        success: false,
        error_type: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  },

  /**
   * Legacy method for backward compatibility - generates everything at once
   * Use getDevelopmentContext() + generateSolutions() for better UX
   */
  getDevelopmentContextLegacy: async (projectId: string): Promise<DevelopmentPhaseData> => {
    try {
      console.log(`[LEGACY] Fetching full development context for project: ${projectId}`);
      
      // Get context first (fast)
      const contextData = await developmentApi.getDevelopmentContext(projectId);
      
      // Then generate solutions (slow)
      const solutionsData = await developmentApi.generateSolutions(projectId);
      
      // Combine for legacy compatibility
      return {
        project_context: contextData.project_context,
        available_solutions: solutionsData.available_solutions,
        ethical_safeguards: contextData.ethical_safeguards,
        solution_rationale: solutionsData.solution_rationale,
        context_loaded: true,
        solutions_loaded: true,
        loading_metadata: {
          context_loaded_at: new Date().toISOString(),
          solutions_loaded_at: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Failed to get legacy development context:', error);
      throw error;
    }
  },

  /**
   * Select an AI solution for the project
   */
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
      throw error;
    }
  },

  /**
   * Generate complete AI project based on selected solution
   */
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
        
        // Track performance metrics
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
      
      // Track error metrics
      trackDevelopmentMetrics({
        project_id: projectId,
        phase: 'generation',
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_ms: duration,
        success: false,
        error_type: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  },

  /**
   * Download specific files from the generated project
   */

  downloadProjectFile: async (
    projectId: string,
    fileType: 'complete' | 'documentation' | 'setup' | 'ethical-report' | 'deployment'
  ): Promise<void> => {
    try {
      console.log(`Downloading ${fileType} for project: ${projectId}`);
      
      // Get the raw response from your backend
      const response = await api.get<DownloadResponse>(
        `development/${projectId}/download/${fileType}`
      );
      
      // Validate response
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from server');
      }
      
      // Process the download using our utility function
      await processDownloadResponse(response, fileType, projectId);
      
    } catch (error) {
      console.error(`Failed to download ${fileType}:`, error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Unknown error occurred while downloading ${fileType}`);
      }
    }
  },

  /**
   * Get development phase status and progress
   */
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
      throw error;
    }
  },

  /**
   * Clear cached data for a project (useful for development/testing)
   */
  clearProjectCache: async (projectId: string): Promise<void> => {
    try {
      await api.delete(`development/${projectId}/cache`);
      console.log(`Cleared cache for project: ${projectId}`);
    } catch (error) {
      console.warn('Failed to clear project cache:', error);
      // Don't throw - cache clearing is not critical
    }
  }
};

/**
 * Helper Functions
 */

/**
 * Create default project generation request
 */
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
      include_tests: true,
      include_deployment_scripts: true,
      ethical_compliance: true
    },
    ethical_preferences: ethicalPreferences.length > 0 ? ethicalPreferences : [
      'privacy_preservation',
      'bias_mitigation', 
      'transparency',
      'user_autonomy'
    ],
    customizations: customizations
  };
};

/**
 * Extract key information from development context for UI display
 */
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
    hasDeploymentEnv: !!project_context.deployment_environment,
    keyRecommendations: project_context.recommendations.slice(0, 3)
  };
};

/**
 * Format technical specs for display (handles both old and new formats)
 */
export const formatTechnicalSpecs = (solution: AISolution): Array<{label: string, value: string}> => {
  // Handle both technical_specs (legacy) and technical_architecture (new)
  const specs = solution.technical_specs || solution.technical_architecture;
  
  if (!specs) {
    return [
      { label: 'Frontend', value: 'Not specified' },
      { label: 'Backend', value: 'Not specified' },
      { label: 'Deployment', value: 'Not specified' },
      { label: 'Data Handling', value: 'Not specified' }
    ];
  }

  // Handle legacy TechnicalSpecs format
  if ('data' in specs) {
    return [
      { label: 'Frontend', value: specs.frontend || 'Not specified' },
      { label: 'Backend', value: specs.backend || 'Not specified' },
      { label: 'Deployment', value: specs.deployment || 'Not specified' },
      { label: 'Data Handling', value: specs.data || 'Not specified' }
    ];
  }

  // Handle new TechnicalArchitecture format
  return [
    { label: 'Frontend', value: specs.frontend || 'Not specified' },
    { label: 'Backend', value: specs.backend || 'Not specified' },
    { label: 'Deployment', value: specs.deployment || 'Not specified' },
    { label: 'Data Processing', value: specs.data_processing || 'Not specified' }
  ];
};

/**
 * Check if a solution is suitable for the project context
 */
export const isSolutionSuitable = (
  solution: AISolution, 
  projectContext: ProjectContext
): { suitable: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  let suitable = true;
  
  // Check deployment environment compatibility
  if (projectContext.deployment_environment) {
    const env = projectContext.deployment_environment;
    
    // Check computing resources
    if (solution.complexity_level === 'enterprise' && 
        !['enterprise', 'cloud'].includes(env.computing_resources)) {
      suitable = false;
      reasons.push('Requires enterprise-level computing resources');
    }
    
    // Check team size
    if (solution.complexity_level === 'enterprise' && 
        ['individual', 'small'].includes(env.team_size)) {
      reasons.push('May be complex for smaller teams');
    }
    
    // Check budget constraints
    if (solution.resource_requirements?.budget_estimate === 'high' && 
        env.project_budget === 'limited') {
      reasons.push('May exceed budget constraints');
    }
  }
  
  // Add positive reasons
  if (suitable) {
    if (solution.recommended) {
      reasons.push('Recommended based on your project characteristics');
    }
    reasons.push('Includes built-in ethical safeguards');
    reasons.push('Tailored for humanitarian use cases');
  }
  
  return { suitable, reasons };
};

/**
 * Create a loading state manager for development phase
 */
export const createDevelopmentLoadingState = (): DevelopmentLoadingState => {
  return {
    context: {
      loading: false,
      loaded: false,
      error: null
    },
    solutions: {
      loading: false,
      loaded: false,
      error: null,
      triggered: false
    },
    generation: {
      loading: false,
      completed: false,
      error: null,
      progress: 0
    }
  };
};

/**
 * Validate project generation request
 */
export const validateProjectGenerationRequest = (request: ProjectGenerationRequest): string[] => {
  const errors: string[] = [];
  
  if (!request.solution_id) {
    errors.push('Solution ID is required');
  }
  
  if (request.ethical_preferences && request.ethical_preferences.length === 0) {
    errors.push('At least one ethical preference must be specified');
  }
  
  return errors;
};

/**
 * Calculate estimated time for solution generation based on complexity
 */
export const estimateSolutionGenerationTime = (projectComplexity: string): number => {
  const baseTime = 8000; // 8 seconds base
  
  switch (projectComplexity) {
    case 'simple':
      return baseTime * 0.8; // 6.4 seconds
    case 'moderate':
      return baseTime; // 8 seconds
    case 'advanced':
      return baseTime * 1.3; // 10.4 seconds
    case 'enterprise':
      return baseTime * 1.6; // 12.8 seconds
    default:
      return baseTime;
  }
};

/**
 * Track development metrics (client-side)
 */
const trackDevelopmentMetrics = (metrics: Omit<DevelopmentMetrics, 'user_agent' | 'browser_performance'>) => {
  try {
    const enhancedMetrics: DevelopmentMetrics = {
      ...metrics,
      user_agent: navigator.userAgent,
      browser_performance: {
        memory_used_mb: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || undefined,
        cpu_usage_percent: undefined // Would need additional APIs
      }
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Development Metrics:', enhancedMetrics);
    }
    
    // Send to analytics service (implement based on your analytics setup)
    // analytics.track('development_phase_performance', enhancedMetrics);
    
  } catch (error) {
    console.warn('Failed to track development metrics:', error);
  }
};

/**
 * Create development error with enhanced context
 */
export const createDevelopmentError = (
  type: DevelopmentError['type'],
  message: string,
  projectId?: string,
  details?: any
): DevelopmentError => {
  return {
    type,
    message,
    details,
    timestamp: new Date().toISOString(),
    project_id: projectId,
    recoverable: type !== 'project_generation', // Most errors are recoverable except generation failures
    suggested_action: getSuggestedAction(type)
  };
};

/**
 * Get suggested action for error recovery
 */
const getSuggestedAction = (errorType: DevelopmentError['type']): string => {
  switch (errorType) {
    case 'context_loading':
      return 'Check your internet connection and retry loading the project context.';
    case 'solutions_generation':
      return 'Our AI service may be busy. Please wait a moment and try generating solutions again.';
    case 'solution_selection':
      return 'Try selecting a different solution or refresh the page.';
    case 'project_generation':
      return 'Please contact support if this issue persists.';
    default:
      return 'Please try again or contact support if the issue persists.';
  }
};

