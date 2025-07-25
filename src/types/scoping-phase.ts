export interface UseCase {
  id: string;
  title: string;
  description: string;
  tags: string[];
  selected: boolean;
  
  category: string;
  complexity?: string;
  source_url?: string;
  similarity_score?: number;
  
  source?: string;
  type?: string;
  
  how_it_works?: string;
  real_world_impact?: string;
  
  similarity_to_project?: string;
  real_world_examples?: string;
  implementation_approach?: string;
  decision_guidance?: string;
  
  key_success_factors?: string[];
  resource_requirements?: string[];
  challenges?: string[];
  
  authors?: string[];
  published_date?: string;
  organization?: string;
  date?: string;
  venue?: string;
  citation_count?: number;
}

export type Dataset = {
  name: string;
  source: string;
  url?: string;
  description: string;
  size_estimate?: string;
  data_types?: string[];
  ethical_concerns?: string[];
  suitability_score?: number;
  
  id?: string;
  title?: string;
  format?: string;
  size?: string;
  license?: string;
  
  last_modified?: string;
  num_resources?: number;
};

export type DataSuitabilityCheck = {
  id: string;
  question: string;
  answer: 'yes' | 'no' | 'unknown';
  description: string;
};

export type TechnicalInfrastructure = {
  computing_resources: string;
  storage_data: string;
  internet_connectivity: string;
  deployment_environment: string;
};

export type InfrastructureAssessment = {
  score: number;
  can_proceed: boolean;
  reasoning: string;
  scoring_breakdown: {
    computing: { score: number; max_score: number; reasoning: string };
    storage: { score: number; max_score: number; reasoning: string };
    connectivity: { score: number; max_score: number; reasoning: string };
    deployment: { score: number; max_score: number; reasoning: string };
  };
  recommendations: string[];
  non_ai_alternatives?: string[];
};

export type SuitabilityResponseOption = {
  value: 'yes' | 'unknown' | 'no';
  label: string;
  description: string;
};

export type SuitabilityHelpContent = {
  lookFor: string[];
  warningsSigns: string[];
  whyMatters: string;
};

export type EnhancedSuitabilityQuestion = {
  id: string;
  title: string;
  question: string;
  description: string;
  helpContent: SuitabilityHelpContent;
  responseOptions: SuitabilityResponseOption[];
};

export interface DataSuitabilitySummary {
  percentage: number;
  suitability_level: 'excellent' | 'good' | 'moderate' | 'poor';
}

export type SuitabilityLevel = 'excellent' | 'good' | 'moderate' | 'poor';

export interface ScopingCompletionData {
  selected_use_case?: UseCase;
  selected_dataset?: Dataset;
  infrastructure_assessment: InfrastructureAssessment;
  data_suitability: DataSuitabilitySummary;
  technical_infrastructure: TechnicalInfrastructure;
  suitability_checks: Array<{id: string; question: string; answer: string; description: string}>;
  active_step: number;
  ready_to_proceed: boolean;
  reasoning?: string;
}

export const INFRASTRUCTURE_OPTIONS = {
  computing_resources: [
    'cloud_platforms',
    'organizational_computers', 
    'partner_shared',
    'community_shared',
    'mobile_devices',
    'basic_hardware',
    'no_computing'
  ],
  storage_data: [
    'secure_cloud',
    'organizational_servers',
    'partner_systems',
    'government_systems',
    'basic_digital',
    'paper_based'
  ],
  internet_connectivity: [
    'stable_broadband',
    'satellite_internet',
    'intermittent_connection',
    'mobile_data_primary',
    'shared_community',
    'limited_connectivity',
    'no_internet'
  ],
  deployment_environment: [
    'cloud_deployment',
    'hybrid_approach',
    'organizational_infrastructure',
    'partner_infrastructure',
    'field_mobile',
    'offline_systems',
    'no_deployment'
  ]
} as const;

export function mapDatasetToBackend(dataset: Dataset) {
  return {
    name: dataset.name || dataset.title || '',
    source: dataset.source || '',
    url: dataset.url || dataset.source || '',
    description: dataset.description || '',
    size_estimate: dataset.size_estimate || dataset.size || 'Unknown',
    data_types: dataset.data_types || [],
    ethical_concerns: dataset.ethical_concerns || [],
    suitability_score: dataset.suitability_score
  };
}

export function mapUseCaseToBackend(useCase: UseCase) {
  return {
    id: useCase.id,
    title: useCase.title,
    description: useCase.description,
    category: useCase.category || 'General',
    complexity: useCase.complexity || 'medium',
    source_url: useCase.source_url,
    similarity_score: useCase.similarity_score,
    tags: useCase.tags || []
  };
}