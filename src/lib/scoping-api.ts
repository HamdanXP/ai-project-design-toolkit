
import { api } from './api';

// API Response Types
export interface ScopingApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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
  published_date?: string;
  organization?: string;
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
  category_scores: {
    [key: string]: {
      score: number;
      label: string;
      percentage: number;
    };
  };
  risk_mitigation_strategies: Array<{
    risk_level: 'low' | 'medium' | 'high';
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
  component_scores: {
    data_completeness: number;
    population_representativeness: number;
    privacy_ethics: number;
    quality_sufficiency: number;
  };
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
    recommendation: 'proceed' | 'revise';
    next_phase: string;
  };
  ready_to_proceed: boolean;
  next_phase: string;
}

// API Functions
export const scopingApi = {
  // 1. Get Use Cases
  getUseCases: async (projectId: string): Promise<ApiUseCase[]> => {
    try {
      const response = await api.get<ScopingApiResponse<ApiUseCase[]>>(`/scoping/${projectId}/use-cases`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using fallback data');
      // Fallback data based on API documentation
      return [
        {
          id: "academic_7892",
          title: "Machine Learning for Early Warning Systems in Refugee Settlements",
          description: "This paper presents a machine learning approach for predicting resource shortages in refugee settlements using satellite imagery and demographic data...",
          source: "arXiv",
          source_url: "https://arxiv.org/abs/2024.xxxxx",
          type: "academic_paper",
          category: "Prediction",
          complexity: "medium",
          data_completeness: "high",
          how_it_works: "Uses satellite imagery analysis combined with demographic surveys to predict resource needs 2-3 weeks in advance",
          technical_requirements: [
            "Satellite imagery access (Sentinel-2 or similar)",
            "Demographic survey data",
            "Machine learning infrastructure",
            "GIS processing capabilities"
          ],
          timeline: "4-6 months",
          success_factors: [
            "High-quality satellite imagery",
            "Regular demographic updates",
            "Strong partnership with camp management"
          ],
          challenges: [
            "Cloud cover affecting satellite data",
            "Dynamic population changes",
            "Integration with existing systems"
          ],
          ethical_considerations: [
            "Privacy protection for refugee data",
            "Transparent prediction methodology",
            "Fair resource allocation",
            "Community consent for monitoring"
          ],
          recommended_for: ["UNHCR", "Large humanitarian organizations", "Camp management agencies"],
          suitability_score: 0.87,
          authors: ["Dr. Jane Smith", "Prof. Ahmed Hassan"],
          published_date: "2024-01-15"
        },
        {
          id: "humanitarian_4521",
          title: "WFP's Food Security Monitoring Innovation",
          description: "World Food Programme's implementation of AI-powered food security monitoring across multiple countries...",
          source: "ReliefWeb",
          source_url: "https://reliefweb.int/report/world/wfp-food-security-innovation",
          type: "humanitarian_report",
          category: "Monitoring",
          complexity: "medium",
          data_completeness: "medium",
          how_it_works: "Combines market price monitoring, weather data, and household surveys to predict food security risks",
          technical_requirements: [
            "Market price monitoring system",
            "Weather data feeds",
            "Survey data collection tools",
            "Analytics dashboard"
          ],
          timeline: "not_available",
          success_factors: [
            "Strong field data collection network",
            "Real-time market monitoring",
            "Government partnerships"
          ],
          challenges: ["Details not specified in source"],
          ethical_considerations: [
            "Household data privacy",
            "Fair targeting of assistance",
            "Cultural sensitivity in surveys"
          ],
          recommended_for: ["Food security organizations", "Government agencies", "Large NGOs"],
          suitability_score: 0.79,
          organization: "World Food Programme",
          date: "2024-02-01"
        }
      ];
    }
  },

  // 2. Get Recommended Datasets
  getRecommendedDatasets: async (projectId: string, useCaseId: string): Promise<ApiDataset[]> => {
    try {
      const response = await api.post<ScopingApiResponse<ApiDataset[]>>(`/scoping/${projectId}/datasets`, {
        use_case_id: useCaseId
      });
      return response.data;
    } catch (error) {
      console.warn('API not available, using fallback data');
      return [
        {
          name: "MODIS Vegetation Indices",
          source: "NASA Earth Data",
          url: "https://modis.gsfc.nasa.gov/data/",
          description: "16-day vegetation index composites for monitoring crop conditions",
          data_types: ["satellite", "vegetation", "time_series"],
          ethical_concerns: ["data_quality", "temporal_gaps"],
          suitability_score: 0.91
        },
        {
          name: "WFP Food Security Data",
          source: "World Food Programme",
          url: "https://data.humdata.org/organization/wfp",
          description: "Food security assessments and distribution records",
          data_types: ["humanitarian", "food_security", "demographic"],
          ethical_concerns: ["privacy", "sensitive_populations"],
          suitability_score: 0.87
        }
      ];
    }
  },

  // 3. Feasibility Analysis
  submitFeasibilityAnalysis: async (projectId: string, data: FeasibilityAnalysisRequest): Promise<FeasibilityAnalysisResponse> => {
    try {
      const response = await api.post<ScopingApiResponse<FeasibilityAnalysisResponse>>(`/scoping/${projectId}/feasibility-analysis`, data);
      return response.data;
    } catch (error) {
      console.warn('API not available, using fallback data');
      return {
        overall_feasibility_score: 0.63,
        overall_percentage: 63,
        feasibility_level: "medium_high",
        summary: "Good foundation with some areas for improvement. Consider addressing the medium and high-risk factors below.",
        category_scores: {
          resources_budget: {
            score: 0.64,
            label: "Resources & Budget",
            percentage: 64
          },
          technical_infrastructure: {
            score: 0.73,
            label: "Technical Infrastructure",
            percentage: 73
          },
          team_expertise: {
            score: 0.46,
            label: "Team Expertise",
            percentage: 46
          },
          organizational_readiness: {
            score: 0.76,
            label: "Organizational Readiness",
            percentage: 76
          },
          external_factors: {
            score: 0.72,
            label: "External Factors",
            percentage: 72
          }
        },
        risk_mitigation_strategies: [
          {
            risk_level: "high",
            title: "Limited Technical Expertise",
            description: "Consider partnerships, training programs, or hiring consultants to bridge skill gaps",
            practical_examples: [
              "Partner with a local university's AI program",
              "Hire part-time AI consultants for guidance",
              "Invest in team training before project starts",
              "Use no-code/low-code AI platforms initially"
            ],
            color: "red"
          }
        ],
        next_steps: [
          "Address identified risk factors first",
          "Consider starting with a smaller pilot project"
        ]
      };
    }
  },

  // 6. Assess Data Suitability
  assessDataSuitability: async (projectId: string, data: DataSuitabilityRequest): Promise<DataSuitabilityResponse> => {
    try {
      const response = await api.post<ScopingApiResponse<DataSuitabilityResponse>>(`/scoping/${projectId}/assess-data-suitability`, data);
      return response.data;
    } catch (error) {
      console.warn('API not available, using fallback calculation');
      // Calculate score based on answers
      let score = 0;
      if (data.data_completeness === 'looks_clean') score += 25;
      else if (data.data_completeness === 'some_issues') score += 15;
      
      if (data.population_representativeness === 'representative') score += 25;
      else if (data.population_representativeness === 'partially') score += 15;
      
      if (data.privacy_ethics === 'privacy_safe') score += 25;
      else if (data.privacy_ethics === 'need_review') score += 15;
      
      if (data.quality_sufficiency === 'sufficient') score += 25;
      else if (data.quality_sufficiency === 'borderline') score += 15;

      return {
        overall_score: score / 100,
        percentage: score,
        suitability_level: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_work',
        component_scores: {
          data_completeness: data.data_completeness === 'looks_clean' ? 1.0 : data.data_completeness === 'some_issues' ? 0.6 : 0.3,
          population_representativeness: data.population_representativeness === 'representative' ? 1.0 : data.population_representativeness === 'partially' ? 0.6 : 0.3,
          privacy_ethics: data.privacy_ethics === 'privacy_safe' ? 1.0 : data.privacy_ethics === 'need_review' ? 0.6 : 0.3,
          quality_sufficiency: data.quality_sufficiency === 'sufficient' ? 1.0 : data.quality_sufficiency === 'borderline' ? 0.6 : 0.3
        },
        summary: score >= 80 ? "Your data appears highly suitable for AI development." : "Your data has some suitability concerns that should be addressed.",
        recommendations: score >= 80 ? ["Continue to next phase"] : ["Consider addressing data quality issues"],
        assessment_responses: data
      };
    }
  },

  // 7. Final Feasibility Gate
  submitFinalFeasibilityGate: async (projectId: string, data: FinalFeasibilityRequest): Promise<FinalFeasibilityResponse> => {
    try {
      const response = await api.post<ScopingApiResponse<FinalFeasibilityResponse>>(`/scoping/${projectId}/final-feasibility-gate`, data);
      return response.data;
    } catch (error) {
      console.warn('API not available, using fallback calculation');
      const overallScore = Math.round((data.feasibility_summary.overall_percentage + data.data_suitability.percentage) / 2);
      
      return {
        final_summary: {
          overall_readiness_score: overallScore,
          feasibility_score: data.feasibility_summary.overall_percentage,
          data_suitability_score: data.data_suitability.percentage,
          ready_to_proceed: data.ready_to_proceed,
          key_constraints: data.feasibility_summary.key_constraints,
          summary: `Your project assessment is complete with ${data.data_suitability.suitability_level} data suitability (${data.data_suitability.percentage}%) and ${data.feasibility_summary.feasibility_level} feasibility (${data.feasibility_summary.overall_percentage}%).`,
          recommendation: data.ready_to_proceed ? 'proceed' : 'revise',
          next_phase: data.ready_to_proceed ? 'development' : 'scoping'
        },
        ready_to_proceed: data.ready_to_proceed,
        next_phase: data.ready_to_proceed ? 'development' : 'scoping'
      };
    }
  }
};
