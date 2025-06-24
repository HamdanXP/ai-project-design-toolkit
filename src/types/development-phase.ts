// types/development-phase.ts - Complete type definitions for development phase with split loading

// Core AI and Deployment Types
export type AITechnique = 
  | "classification"
  | "computer_vision" 
  | "nlp"
  | "llm"
  | "time_series"
  | "recommendation"
  | "anomaly_detection"
  | "regression"
  | "clustering"
  | "optimization"
  | "multi_modal"
  | "reinforcement_learning";

export type DeploymentStrategy = 
  | "local_processing"
  | "cloud_native"
  | "api_integration"
  | "hybrid_approach"
  | "edge_computing"
  | "federated_learning"
  | "serverless";

export type ComplexityLevel = "simple" | "moderate" | "advanced" | "enterprise";

// Project and Context Types
export interface ProjectRecommendation {
  type: string;
  title: string;
  description: string;
  confidence: number;
  reason: string;
  deployment_strategy: DeploymentStrategy;
}

export interface EthicalSafeguard {
  category: string;
  measures: string[];
  icon: string;
  priority?: "low" | "medium" | "high" | "critical";
}

export interface TechnicalArchitecture {
  ai_technique: AITechnique;
  deployment_strategy: DeploymentStrategy;
  frontend: string;
  backend: string;
  ai_components: string[];
  data_processing: string;
  deployment: string;
  monitoring: string;
}

export interface ResourceRequirement {
  computing_power: string;
  storage_needs: string;
  internet_dependency: string;
  technical_expertise: string;
  budget_estimate: string;
}

// Legacy technical specs interface for backward compatibility
export interface TechnicalSpecs {
  frontend: string;
  backend: string;
  deployment: string;
  data: string;
}

export interface AISolution {
  id: string;
  title: string;
  description: string;
  ai_technique: AITechnique;
  complexity_level: ComplexityLevel;
  deployment_strategy: DeploymentStrategy;
  recommended: boolean;
  confidence_score: number;

  // Capabilities and features
  capabilities: string[];
  key_features: string[];
  technical_architecture: TechnicalArchitecture;
  resource_requirements: ResourceRequirement;

  // Context and suitability
  best_for: string;
  use_case_alignment: string;
  deployment_considerations: string[];

  // Ethical and practical considerations
  ethical_safeguards: EthicalSafeguard[];
  implementation_timeline: string;
  maintenance_requirements: string[];

  // API and integration options
  external_apis?: string[];
  integration_complexity?: string;

  // Legacy compatibility
  technical_specs?: TechnicalSpecs;
}

export interface ProjectContext {
  title: string;
  description: string;
  target_beneficiaries: string;
  problem_domain: string;
  selected_use_case?: any;
  use_case_analysis?: any;
  deployment_environment?: any;
  deployment_analysis?: any;
  recommendations: ProjectRecommendation[];
  technical_recommendations: string[];
  deployment_recommendations: string[];
}

// Split Loading Types - NEW
export interface ProjectContextOnly {
  project_context: ProjectContext;
  ethical_safeguards: EthicalSafeguard[];
  solution_rationale?: string;
}

export interface SolutionsData {
  available_solutions: AISolution[];
  solution_rationale: string;
}

// Main Development Phase Data
export interface DevelopmentPhaseData {
  project_context: ProjectContext;
  available_solutions: AISolution[];
  ethical_safeguards: EthicalSafeguard[];
  solution_rationale: string;
  
  // Split loading metadata
  context_loaded?: boolean;
  solutions_loaded?: boolean;
  loading_metadata?: {
    context_loaded_at?: string;
    solutions_loaded_at?: string;
    solutions_generation_time_ms?: number;
  };
}

// Project Generation Types
export interface GeneratedProject {
  id: string;
  title: string;
  description: string;
  solution_type: string;
  ai_technique: AITechnique;
  deployment_strategy: DeploymentStrategy;
  files: Record<string, string>;
  documentation: string;
  setup_instructions: string;
  deployment_guide: string;
  ethical_audit_report: string;
  bias_testing_plan: string;
  monitoring_recommendations: string;
  api_documentation?: string;
  integration_examples?: Record<string, string>;
}

export interface ProjectGenerationRequest {
  solution_id: string;
  project_requirements?: Record<string, any>; // Legacy compatibility
  customizations?: Record<string, any>;
  ethical_preferences?: string[];
  deployment_preferences?: Record<string, any>;
  integration_requirements?: string[];
}

export interface ProjectGenerationResponse {
  success: boolean;
  project?: GeneratedProject;
  generation_steps: string[];
  estimated_completion_time: string;
  next_steps: string[];
  alternative_approaches?: string[];
}

// Selection and Status Types
export interface SolutionSelection {
  solution_id: string;
  solution_title: string;
  selected_at: string;
  reasoning?: string;
}

export interface DevelopmentStatus {
  completed: boolean;
  phase_status: string;
  
  // Split loading status - ENHANCED
  context_loaded: boolean;
  solutions_generated: boolean;
  solutions_loading?: boolean;
  
  selected_solution?: SolutionSelection;
  generated_project: boolean;
  development_data: any;
  can_proceed: boolean;
  
  // Performance metadata
  performance_metrics?: {
    context_load_time_ms?: number;
    solutions_generation_time_ms?: number;
    total_load_time_ms?: number;
  };
}

// API Response Types
export interface DevelopmentApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: {
    generated_at: string;
    performance_ms?: number;
    cache_hit?: boolean;
  };
}

// UI and Hook Types
export interface DevelopmentLoadingState {
  context: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
  };
  solutions: {
    loading: boolean;
    loaded: boolean;
    error: string | null;
    triggered: boolean; // Has the user requested solutions to be loaded
  };
  generation: {
    loading: boolean;
    completed: boolean;
    error: string | null;
    progress: number;
  };
}

export interface DevelopmentPhaseStep {
  id: string;
  title: string;
  completed: boolean;
  canAccess: boolean;
}

// Enhanced error types for better debugging
export interface DevelopmentError {
  type: 'context_loading' | 'solutions_generation' | 'solution_selection' | 'project_generation';
  message: string;
  details?: any;
  timestamp: string;
  project_id?: string;
  recoverable: boolean;
  suggested_action?: string;
}

// Backend model types
export interface ProjectContextOnlyBackend {
  project_context: ProjectContext;
  ethical_safeguards: EthicalSafeguard[];
  solution_rationale?: string;
  generated_at: string;
  performance_metrics: {
    analysis_time_ms: number;
    recommendation_time_ms: number;
    total_time_ms: number;
  };
}

export interface SolutionsDataBackend {
  available_solutions: AISolution[];
  solution_rationale: string;
  generated_at: string;
  performance_metrics: {
    solution_generation_time_ms: number;
    llm_calls_count: number;
    cache_hits: number;
  };
  generation_metadata: {
    use_case_analysis_cached: boolean;
    deployment_analysis_cached: boolean;
    solutions_count: number;
    recommended_count: number;
  };
}

// Caching interface for performance optimization
export interface DevelopmentCache {
  context: {
    [projectId: string]: {
      data: ProjectContextOnly;
      cached_at: string;
      expires_at: string;
    };
  };
  use_case_analysis: {
    [cacheKey: string]: {
      analysis: any;
      cached_at: string;
      expires_at: string;
    };
  };
  deployment_analysis: {
    [cacheKey: string]: {
      analysis: any;
      cached_at: string;
      expires_at: string;
    };
  };
}

// Performance monitoring types
export interface DevelopmentMetrics {
  project_id: string;
  phase: 'context' | 'solutions' | 'generation';
  start_time: string;
  end_time: string;
  duration_ms: number;
  success: boolean;
  error_type?: string;
  cache_hit?: boolean;
  llm_calls?: number;
  solutions_generated?: number;
  user_agent?: string;
  browser_performance?: {
    memory_used_mb?: number;
    cpu_usage_percent?: number;
  };
}

// Legacy types for backward compatibility
export interface PipelineType {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
}

export interface EthicalGuardrail {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

export interface PrototypeMilestone {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

export interface TestResult {
  id: string;
  timestamp: string;
  inputs: string;
  outputs: string;
  notes: string;
}

export interface EvaluationCriteria {
  id: string;
  question: string;
  answer: 'yes' | 'no' | 'partially' | 'unknown';
  notes: string;
}

export type DevelopmentDecision = 'proceed' | 'iterate' | 'revisit' | null;

export interface RiskAssessment {
  id: string;
  category: string;
  level: 'low' | 'medium' | 'high' | 'unknown';
  notes: string;
}

export interface StakeholderFeedback {
  id: string;
  stakeholder: string;
  feedback: string;
  priority: 'low' | 'medium' | 'high';
  addressed: boolean;
}

export interface ImpactGoalCheck {
  id: string;
  question: string;
  isAligned: boolean;
  notes: string;
}

export interface CompleteProjectDownloadResponse {
  message: string;
  files: Record<string, string>;
}

export interface SingleFileDownloadResponse {
  content: string;
}

export type EvaluationDecision = 'deploy' | 'improve' | 'abandon' | null;

export type DownloadResponse = CompleteProjectDownloadResponse | SingleFileDownloadResponse;

export const isCompleteProjectResponse = (response: any): response is CompleteProjectDownloadResponse => {
  return response && typeof response === 'object' && 'files' in response && typeof response.files === 'object';
};

export const isSingleFileResponse = (response: any): response is SingleFileDownloadResponse => {
  return response && typeof response === 'object' && 'content' in response && typeof response.content === 'string';
};