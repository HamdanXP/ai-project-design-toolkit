export interface EvaluationPhaseStep {
  id: string;
  title: string;
  completed: boolean;
  canAccess: boolean;
}

export type SimulationType = 'statistics_based' | 'example_scenarios' | 'suitability_assessment';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type EvaluationStatus = 'ready_for_deployment' | 'needs_minor_improvements' | 'needs_significant_improvements';
export type TestingMethod = 'dataset' | 'scenarios' | 'bypass';
export type EvaluationApproach = 'dataset_analysis' | 'scenario_based' | 'evaluation_bypass';

export interface FeatureCompatibility {
  compatible: boolean;
  missing_required: string[];
  missing_optional: string[];
  available_required: string[];
  compatibility_score: number;
  gap_explanation: string;
}

export interface DataVolumeAssessment {
  sufficient: boolean;
  available_rows: number;
  required_rows: number;
  volume_score: number;
  recommendation: string;
}

export interface DataQualityAssessment {
  quality_score: number;
  completeness_percentage: number;
  issues_found: string[];
  recommendations: string[];
}

export interface SuitabilityRecommendation {
  type: 'data_collection' | 'solution_alternative' | 'improvement';
  priority: 'low' | 'medium' | 'high';
  issue: string;
  suggestion: string;
}

export interface SuitabilityAssessment {
  is_suitable: boolean;
  overall_score: number;
  feature_compatibility: FeatureCompatibility;
  data_volume_assessment: DataVolumeAssessment;
  data_quality_assessment: DataQualityAssessment;
  recommendations: SuitabilityRecommendation[];
  performance_estimate?: string;
}

export interface EvaluationBypass {
  message: string;
  guidance: string;
  can_download: boolean;
  next_steps: string[];
  specialist_consultation: string;
}

export interface SimulationCapabilities {
  testing_method: TestingMethod;
  evaluation_approach: EvaluationApproach;
  ai_technique: string;
  data_formats_supported: string[];
  explanation: string;
}

export interface TestingScenario {
  name: string;
  description: string;
  input_description: string;
  process_description: string;
  expected_outcome: string;
  success_criteria: string;
  humanitarian_impact: string;
}

export interface EvaluationContext {
  generated_project: Record<string, any>;
  selected_solution: Record<string, any>;
  simulation_capabilities: SimulationCapabilities;
  testing_scenarios?: TestingScenario[];
  evaluation_bypass?: EvaluationBypass;
  available_downloads: string[];
}

export interface SimulationRequest {
  dataset_statistics?: Record<string, any>;
  simulation_type: SimulationType;
  custom_scenarios?: string[];
}

export interface ScenarioResult {
  scenario_name: string;
  input_provided: string;
  actual_output: string;
  component_used: string;
  execution_time_ms?: number;
  humanitarian_relevance_assessment: string;
  relevance_score?: number;
}

export interface ComponentTransparency {
  component_type: 'llm' | 'nlp' | 'none';
  system_prompt?: string;
  processing_approach?: string;
  model_used?: string;
}

export interface SimulationExplanation {
  methodology: string;
  data_usage: string;
  calculation_basis: string[];
  limitations: string[];
}

export interface ScenarioPerformance {
  scenario_name: string;
  relevance_score: number;
  performance_level: 'excellent' | 'good' | 'acceptable' | 'poor';
  key_insights: string;
}

export interface ComponentEffectiveness {
  component_type: string;
  overall_effectiveness: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ScenarioSuitabilityAssessment {
  is_suitable: boolean;
  overall_score: number;
  scenario_performances: ScenarioPerformance[];
  component_effectiveness: ComponentEffectiveness;
  humanitarian_relevance: number;
  recommendations: SuitabilityRecommendation[];
  performance_summary: string;
}

export interface SimulationResult {
  simulation_type: SimulationType;
  testing_method: TestingMethod;
  confidence_level: ConfidenceLevel;
  suitability_assessment?: SuitabilityAssessment;
  scenario_suitability_assessment?: ScenarioSuitabilityAssessment;
  scenario_results?: ScenarioResult[];
  evaluation_bypass?: EvaluationBypass;
  component_transparency?: ComponentTransparency;
  simulation_explanation: SimulationExplanation;
}

export interface EvaluationSummary {
  overall_assessment: string;
  solution_performance: Record<string, any>;
  deployment_readiness: boolean;
  recommendation: string;
  key_strengths: string[];
  areas_for_improvement: string[];
}

export interface EvaluationResult {
  status: EvaluationStatus;
  evaluation_summary: EvaluationSummary;
  simulation_results: SimulationResult;
  development_feedback?: string;
  decision_options: string[];
  next_steps: string[];
  evaluation_timestamp: string;
}

export interface ScenarioRegenerationRequest {
  custom_scenarios?: string[];
  focus_areas?: string[];
}

export interface EvaluationApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  metadata?: {
    generated_at: string;
    performance_ms?: number;
    cache_hit?: boolean;
  };
}

export interface EvaluationStatusData {
  completed: boolean;
  phase_status: string;
  has_simulation: boolean;
  has_evaluation: boolean;
  testing_method: TestingMethod;
  evaluation_result?: EvaluationResult;
  can_download: boolean;
  evaluation_data?: Record<string, any>;
}

export interface DocumentDownloadInfo {
  key: string;
  title: string;
  description: string;
  icon: string;
  priority: 'primary' | 'secondary';
}

export const AVAILABLE_DOCUMENTS: DocumentDownloadInfo[] = [
  {
    key: 'complete_project',
    title: 'Complete Project',
    description: 'All source code and project files in ZIP format',
    icon: 'Download',
    priority: 'secondary'
  },
  {
    key: 'documentation',
    title: 'Project Documentation',
    description: 'Comprehensive project overview and user guide (Markdown)',
    icon: 'FileText',
    priority: 'secondary'
  },
  {
    key: 'setup_instructions',
    title: 'Setup Guide',
    description: 'Step-by-step installation and setup instructions (Markdown)',
    icon: 'Settings',
    priority: 'secondary'
  },
  {
    key: 'deployment_guide',
    title: 'Deployment Guide',
    description: 'Production deployment and scaling guidance (Markdown)',
    icon: 'Rocket',
    priority: 'secondary'
  },
  {
    key: 'ethical_assessment_guide',
    title: 'Ethical Assessment Guide',
    description: 'Comprehensive ethical assessment and bias testing guide (Markdown)',
    icon: 'Shield',
    priority: 'secondary'
  },
  {
    key: 'technical_handover_package',
    title: 'Technical Handover Package',
    description: 'Complete technical documentation for production teams (Markdown)',
    icon: 'Users',
    priority: 'secondary'
  }
];