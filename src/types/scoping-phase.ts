export interface UseCase {
  id: string;
  title: string;
  description: string;
  tags: string[];
  selected: boolean;
  
  // Backend aligned fields
  category: string;
  complexity?: string; // 'low', 'medium', 'high'
  source_url?: string;
  similarity_score?: number;
  
  // Source information
  source?: string;
  type?: string;
  
  // Core educational content (simplified for humanitarian professionals)
  how_it_works?: string;
  real_world_impact?: string;
  
  // NEW: Humanitarian-focused educational content
  similarity_to_project?: string;        // How this relates to user's specific project
  real_world_examples?: string;          // Concrete examples of humanitarian implementation
  implementation_approach?: string;      // Practical steps for implementation
  decision_guidance?: string;            // Help users decide if this is right for them
  
  // Practical implementation information
  key_success_factors?: string[];        // What makes this approach work well
  resource_requirements?: string[];      // Data, infrastructure, and organizational needs
  challenges?: string[];                 // Implementation considerations (non-technical)
  
  // Optional metadata from different sources
  authors?: string[];
  published_date?: string;
  organization?: string;
  date?: string;
  venue?: string;
  citation_count?: number;
}

// Updated Dataset type to align with backend model
export type Dataset = {
  // Backend aligned fields
  name: string;
  source: string;
  url?: string;
  description: string;
  size_estimate?: string;
  data_types?: string[];
  ethical_concerns?: string[];
  suitability_score?: number;
  
  // Frontend convenience fields (computed from backend fields)
  id?: string; // Computed from name
  title?: string; // Maps to name
  format?: string; // Derived from data_types
  size?: string; // Maps to size_estimate
  license?: string; // Default value
  
  // Additional fields for enhanced dataset information
  last_modified?: string;
  num_resources?: number;
};

export type FeasibilityConstraint = {
  id: string;
  label: string;
  value: string | boolean;
  options?: string[];
  type: 'toggle' | 'select' | 'input';
  category?: string;
  helpText?: string;
  examples?: string[];
  feasibilityLevel?: 'high' | 'medium' | 'low'; // Changed from riskLevel
  importance?: 'critical' | 'important' | 'moderate';
};

export type DataSuitabilityCheck = {
  id: string;
  question: string;
  answer: 'yes' | 'no' | 'unknown';
  description: string;
};

export type FeasibilityCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  constraints: FeasibilityConstraint[];
};

export type RiskMitigation = {
  risk: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  examples: string[];
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

// New types for scoping completion
export interface FeasibilitySummary {
  overall_percentage: number;
  feasibility_level: 'high' | 'medium' | 'low';
  key_constraints: string[];
}

export interface DataSuitabilitySummary {
  percentage: number;
  suitability_level: 'excellent' | 'good' | 'moderate' | 'poor';
}

export type SuitabilityLevel = 'excellent' | 'good' | 'moderate' | 'poor';

export interface ScopingCompletionData {
  selected_use_case?: UseCase;
  selected_dataset?: Dataset;
  feasibility_summary: FeasibilitySummary;
  data_suitability: DataSuitabilitySummary;
  constraints: Array<{id: string; label: string; value: string | boolean; type: string}>;
  suitability_checks: Array<{id: string; question: string; answer: string; description: string}>;
  active_step: number;
  ready_to_proceed: boolean;
  reasoning?: string;
}

// Helper function to convert frontend Dataset to backend Dataset
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

// Helper function to convert frontend UseCase to backend UseCase
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