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

export interface RequiredFeature {
  name: string;
  description: string;
  data_type: string;
  humanitarian_purpose: string;
}

export interface TabularDataRequirements {
  required_features: RequiredFeature[];
  optional_features: RequiredFeature[];
  minimum_rows: number;
  data_types: Record<string, string>;
}

export interface LLMRequirements {
  system_prompt: string;
  suggested_model: string;
  key_parameters: Record<string, any>;
}

export interface NLPRequirements {
  preprocessing_steps: string[];
  processing_approach: string;
  feature_extraction: string;
  expected_input_format: string;
}

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
  implementation: string;
  ai_component: string;
  data_input: string;
  output_format: string;
  user_interface: string;
  deployment_method: string;
}

export interface ResourceRequirement {
  computing_power: string;
  storage_needs: string;
  internet_dependency: string;
  technical_expertise: string;
  setup_time: string;
}

export interface AISolution {
  id: string;
  title: string;
  description: string;
  ai_technique: AITechnique;
  deployment_strategy: DeploymentStrategy;
  recommended: boolean;
  confidence_score: number;
  needs_dataset: boolean;
  dataset_type?: 'tabular' | 'text' | 'image' | 'audio' | 'video' | 'none';
  tabular_requirements?: TabularDataRequirements;
  llm_requirements?: LLMRequirements;
  nlp_requirements?: NLPRequirements;
  capabilities: string[];
  key_features: string[];
  technical_architecture: TechnicalArchitecture;
  resource_requirements: ResourceRequirement;
  best_for: string;
  use_case_alignment: string;
  implementation_notes: string[];
  ethical_safeguards: EthicalSafeguard[];
  estimated_setup_time: string;
  maintenance_requirements: string[];
  data_requirements: string[];
  output_examples: string[];
}

export interface ProjectContext {
  title: string;
  description: string;
  target_beneficiaries: string;
  problem_domain: string;
  selected_use_case?: any;
  use_case_analysis?: any;
  technical_infrastructure?: any;
  deployment_analysis?: any;
  recommendations: ProjectRecommendation[];
  technical_recommendations: string[];
  deployment_recommendations: string[];
}

export interface ProjectContextOnly {
  project_context: ProjectContext;
  ethical_safeguards: EthicalSafeguard[];
  solution_rationale?: string;
}

export interface SolutionsData {
  available_solutions: AISolution[];
  solution_rationale: string;
}

export interface FileAnalysis {
  filename: string;
  purpose: string;
  content_type: string;
  key_features: string[];
  dependencies: string[];
}

export interface EthicalGuardrailStatus {
  category: string;
  status: string;
  implementation_details: string[];
  verification_method: string;
}

export interface ProductionRequirements {
  security_requirements: string[];
  error_handling_patterns: string[];
  monitoring_approach: string[];
  compliance_framework: string[];
  scalability_considerations: string[];
  ethical_implementation_guide: string[];
}

export interface HandoverDocumentation {
  technical_implementation_guide: string;
  resource_requirements: string;
  timeline_estimate: string;
  risk_assessment: string;
  success_metrics: string[];
  maintenance_plan: string;
}

export interface GenerationReport {
  solution_approach: string;
  files_generated: FileAnalysis[];
  ethical_implementation: EthicalGuardrailStatus[];
  architecture_decisions: string[];
  deployment_considerations: string[];
  production_requirements: ProductionRequirements;
  handover_documentation: HandoverDocumentation;
}

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
  generation_report: GenerationReport;
  api_documentation?: string;
  integration_examples?: Record<string, string>;
}

export interface ProjectGenerationRequest {
  solution_id: string;
  project_requirements?: Record<string, any>;
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

export interface SolutionSelection {
  solution_id: string;
  solution_title: string;
  selected_at: string;
  reasoning?: string;
}

export interface DevelopmentStatus {
  completed: boolean;
  phase_status: string;

  context_loaded: boolean;
  solutions_generated: boolean;
  solutions_loading?: boolean;

  selected_solution?: SolutionSelection;
  generated_project: boolean;
  development_data: any;
  can_proceed: boolean;

  performance_metrics?: {
    context_load_time_ms?: number;
    solutions_generation_time_ms?: number;
    total_load_time_ms?: number;
  };
}

export interface DevelopmentPhaseData {
  project_context: ProjectContext;
  available_solutions: AISolution[];
  ethical_safeguards: EthicalSafeguard[];
  solution_rationale: string;

  context_loaded?: boolean;
  solutions_loaded?: boolean;
  loading_metadata?: {
    context_loaded_at?: string;
    solutions_loaded_at?: string;
    solutions_generation_time_ms?: number;
  };
}

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

export interface DevelopmentPhaseStep {
  id: string;
  title: string;
  completed: boolean;
  canAccess: boolean;
}

export interface DevelopmentError {
  type:
    | "context_loading"
    | "solutions_generation"
    | "solution_selection"
    | "project_generation";
  message: string;
  details?: any;
  timestamp: string;
  project_id?: string;
  recoverable: boolean;
  suggested_action?: string;
}

export interface DevelopmentMetrics {
  project_id: string;
  phase: "context" | "solutions" | "generation";
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

export interface CompleteProjectDownloadResponse {
  message: string;
  files: Record<string, string>;
}

export interface SingleFileDownloadResponse {
  content: string;
}

export type DownloadResponse =
  | CompleteProjectDownloadResponse
  | SingleFileDownloadResponse;

export const isCompleteProjectResponse = (
  response: any
): response is CompleteProjectDownloadResponse => {
  return (
    response &&
    typeof response === "object" &&
    "files" in response &&
    typeof response.files === "object"
  );
};

export const isSingleFileResponse = (
  response: any
): response is SingleFileDownloadResponse => {
  return (
    response &&
    typeof response === "object" &&
    "content" in response &&
    typeof response.content === "string"
  );
};
