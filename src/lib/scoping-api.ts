import {
  UseCase,
  Dataset,
  ScopingCompletionData,
  TechnicalInfrastructure,
  InfrastructureAssessment,
  mapDatasetToBackend,
  mapUseCaseToBackend,
  DatasetStatistics,
  EthicalAnalysis,
} from "@/types/scoping-phase";
import { api } from "./api";

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
  type:
    | "academic_paper"
    | "humanitarian_report"
    | "case_study"
    | "ai_application"
    | "use_case_repository"
    | "curated_template";
  category: string;

  how_it_works: string;
  real_world_impact: string;

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

export interface ScopingCompletionRequest {
  selected_use_case?: UseCase;
  selected_dataset?: Dataset;

  infrastructure_assessment: InfrastructureAssessment;
  data_suitability: {
    percentage: number;
    suitability_level: string;
  };

  technical_infrastructure: TechnicalInfrastructure;
  suitability_checks: Array<{
    id: string;
    question: string;
    answer: string;
    description: string;
  }>;

  active_step: number;
  ready_to_proceed: boolean;
  reasoning?: string;
}

export const convertApiUseCase = (apiUseCase: ApiUseCase): UseCase => {
  try {
    const tags = [];

    if (apiUseCase.category && apiUseCase.category !== "General") {
      tags.push(apiUseCase.category);
    }

    const contentText =
      `${apiUseCase.title} ${apiUseCase.description}`.toLowerCase();

    if (
      contentText.includes("health") ||
      contentText.includes("medical") ||
      contentText.includes("disease")
    ) {
      tags.push("Health");
    }
    if (
      contentText.includes("crop") ||
      contentText.includes("agriculture") ||
      contentText.includes("farming") ||
      contentText.includes("food")
    ) {
      tags.push("Agriculture");
    }
    if (contentText.includes("water") || contentText.includes("sanitation")) {
      tags.push("Water & Sanitation");
    }
    if (contentText.includes("disaster") || contentText.includes("emergency")) {
      tags.push("Disaster Response");
    }
    if (contentText.includes("education") || contentText.includes("learning")) {
      tags.push("Education");
    }

    if (
      contentText.includes("prediction") ||
      contentText.includes("forecast")
    ) {
      tags.push("Prediction");
    }
    if (
      contentText.includes("classification") ||
      contentText.includes("detection")
    ) {
      tags.push("Classification");
    }
    if (contentText.includes("optimization")) {
      tags.push("Optimization");
    }
    if (
      contentText.includes("monitoring") ||
      contentText.includes("surveillance")
    ) {
      tags.push("Monitoring");
    }

    let formattedSourceUrl = apiUseCase.source_url || "";

    if (formattedSourceUrl) {
      if (formattedSourceUrl.startsWith("gs://")) {
        formattedSourceUrl = `https://storage.googleapis.com/${formattedSourceUrl.slice(
          5
        )}`;
      }

      if (
        formattedSourceUrl &&
        !formattedSourceUrl.startsWith("http://") &&
        !formattedSourceUrl.startsWith("https://")
      ) {
        formattedSourceUrl = "https://" + formattedSourceUrl;
      }
    }

    return {
      id: apiUseCase.id,
      title: apiUseCase.title || "Untitled Use Case",
      description: apiUseCase.description || "No description available",
      tags: [...new Set(tags)].filter(Boolean).slice(0, 4),
      selected: false,

      category: apiUseCase.category || "General",
      complexity: "medium",
      source_url: formattedSourceUrl,

      source: apiUseCase.source,
      type: apiUseCase.type,

      how_it_works: apiUseCase.how_it_works,
      real_world_impact: apiUseCase.real_world_impact,

      similarity_to_project: apiUseCase.similarity_to_project,
      real_world_examples: apiUseCase.real_world_examples,
      implementation_approach: apiUseCase.implementation_approach,
      decision_guidance: apiUseCase.decision_guidance,

      key_success_factors: apiUseCase.key_success_factors,
      resource_requirements: apiUseCase.resource_requirements,
      challenges: apiUseCase.challenges,

      authors: apiUseCase.authors,
      published_date: apiUseCase.published_date,
      organization: apiUseCase.organization,
      date: apiUseCase.date,
      venue: apiUseCase.venue,
      citation_count: apiUseCase.citation_count,
    };
  } catch (error) {
    console.error("Error converting API use case:", error);
    return {
      id: apiUseCase.id || `fallback_${Date.now()}`,
      title: apiUseCase.title || "Use Case",
      description: apiUseCase.description || "Description not available",
      tags: ["General"],
      selected: false,
      category: apiUseCase.category || "General",
      source_url: apiUseCase.source_url || "",
      source: apiUseCase.source || "Unknown",

      how_it_works:
        apiUseCase.how_it_works || "Technical details not available",
      real_world_impact:
        apiUseCase.real_world_impact || "Impact details not available",
      key_success_factors: apiUseCase.key_success_factors || [
        "Details not available",
      ],
      challenges: apiUseCase.challenges || ["Not specified"],
      type: apiUseCase.type || "ai_application",
    };
  }
};

export const convertApiDataset = (apiDataset: ApiDataset): Dataset => {
  return {
    name: apiDataset.name,
    source: apiDataset.url || apiDataset.source,
    url: apiDataset.url,
    description: apiDataset.description,
    size_estimate: apiDataset.size || "Unknown",
    data_types: apiDataset.data_types || [],
    ethical_concerns: apiDataset.ethical_concerns || [],
    suitability_score: apiDataset.suitability_score,

    id: apiDataset.name.toLowerCase().replace(/\s+/g, "_"),
    title: apiDataset.name,
    format: "Various",
    size: apiDataset.size || "Unknown",
    license: apiDataset.license || "Various",

    last_modified: apiDataset.last_modified,
    num_resources: apiDataset.num_resources,
  };
};

const normalizeRiskLevel = (level: any): 'low' | 'medium' | 'high' => {
  if (typeof level === 'string') {
    const normalized = level.toLowerCase();
    if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
      return normalized as 'low' | 'medium' | 'high';
    }
  }
  return 'medium';
};

const transformEthicalAnalysis = (apiData: any): EthicalAnalysis => {
  return {
    overallRiskLevel: normalizeRiskLevel(apiData.overall_risk_level),
    biasAssessment: {
      level: normalizeRiskLevel(apiData.bias_assessment?.level),
      concerns: apiData.bias_assessment?.concerns || [],
      recommendations: apiData.bias_assessment?.recommendations || [],
    },
    fairnessEvaluation: {
      representationIssues:
        apiData.fairness_evaluation?.representation_issues || [],
      recommendations: apiData.fairness_evaluation?.recommendations || [],
    },
    privacyEvaluation: {
      riskLevel: normalizeRiskLevel(apiData.privacy_evaluation?.risk_level),
      concerns: apiData.privacy_evaluation?.concerns || [],
      recommendations: apiData.privacy_evaluation?.recommendations || [],
      assessmentReasoning:
        apiData.privacy_evaluation?.assessment_reasoning || "",
    },
    overallRecommendation: apiData.overall_recommendation || "",
    suitabilityScore: apiData.suitability_score || 0,
    scoringBreakdown: apiData.scoring_breakdown ? {
      privacy_score: apiData.scoring_breakdown.privacy_score || { score: 0, weight: 30, points: 0, reasoning: "Not available" },
      fairness_score: apiData.scoring_breakdown.fairness_score || { score: 0, weight: 25, points: 0, reasoning: "Not available" },
      quality_score: apiData.scoring_breakdown.quality_score || { score: 0, weight: 25, points: 0, reasoning: "Not available" },
      humanitarian_alignment: apiData.scoring_breakdown.humanitarian_alignment || { score: 0, weight: 20, points: 0, reasoning: "Not available" }
    } : undefined
  };
};

export const scopingApi = {
  getUseCases: async (
    projectId: string,
    technicalInfrastructure?: TechnicalInfrastructure
  ): Promise<ApiUseCase[]> => {
    try {
      const requestBody = technicalInfrastructure
        ? { technical_infrastructure: technicalInfrastructure }
        : {};

      const response = await api.post<ScopingApiResponse<ApiUseCase[]>>(
        `scoping/${projectId}/use-cases`,
        requestBody
      );

      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      return [];
    }
  },

  getRecommendedDatasets: async (
    projectId: string,
    useCaseId: string,
    useCaseTitle?: string,
    useCaseDescription?: string
  ): Promise<ApiDataset[]> => {
    try {
      const response = await api.post<ScopingApiResponse<ApiDataset[]>>(
        `scoping/${projectId}/datasets`,
        {
          use_case_id: useCaseId,
          use_case_title: useCaseTitle,
          use_case_description: useCaseDescription,
        }
      );

      if (response.success) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        } else {
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  },

  analyzeDatasetEthics: async (
    projectId: string,
    statistics: DatasetStatistics
  ): Promise<EthicalAnalysis> => {
    try {
      const response = await api.post<ScopingApiResponse<EthicalAnalysis>>(
        `scoping/${projectId}/analyze-dataset-ethics`,
        { statistics }
      );

      if (response.success) {
        return transformEthicalAnalysis(response.data);
      } else {
        throw new Error(response.message || "Failed to analyze dataset ethics");
      }
    } catch (error) {
      console.error("Dataset ethics analysis failed:", error);
      throw error;
    }
  },

  assessInfrastructure: async (
    projectId: string,
    infrastructure: TechnicalInfrastructure
  ): Promise<InfrastructureAssessment> => {
    if (!projectId) {
      throw new Error("Project ID is required for infrastructure assessment");
    }

    const normalizedInfrastructure: TechnicalInfrastructure = {
      computing_resources: infrastructure.computing_resources || "",
      storage_data:
        infrastructure.storage_data ||
        (infrastructure as any).storage_infrastructure ||
        "",
      internet_connectivity: infrastructure.internet_connectivity || "",
      deployment_environment: infrastructure.deployment_environment || "",
    };

    const validOptions = {
      computing_resources: [
        "cloud_platforms",
        "organizational_computers",
        "partner_shared",
        "community_shared",
        "mobile_devices",
        "basic_hardware",
        "no_computing",
      ],
      storage_data: [
        "secure_cloud",
        "organizational_servers",
        "partner_systems",
        "government_systems",
        "basic_digital",
        "paper_based",
        "local_storage",
      ],
      internet_connectivity: [
        "stable_broadband",
        "satellite_internet",
        "intermittent_connection",
        "mobile_data_primary",
        "shared_community",
        "limited_connectivity",
        "no_internet",
      ],
      deployment_environment: [
        "cloud_deployment",
        "hybrid_approach",
        "organizational_infrastructure",
        "partner_infrastructure",
        "field_mobile",
        "offline_systems",
        "no_deployment",
      ],
    };

    for (const [key, value] of Object.entries(normalizedInfrastructure)) {
      if (
        value &&
        !validOptions[key as keyof typeof validOptions]?.includes(value)
      ) {
        throw new Error(
          `Invalid infrastructure option: ${key} = ${value}. Valid options are: ${validOptions[
            key as keyof typeof validOptions
          ]?.join(", ")}`
        );
      }
    }

    const response = await api.backend.scoping.assessInfrastructure(
      projectId,
      normalizedInfrastructure
    );

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to assess infrastructure");
    }
  },

  completeScopingPhase: async (
    projectId: string,
    scopingData: ScopingCompletionData
  ): Promise<ScopingApiResponse<any>> => {
    const requestData = {
      selected_use_case: scopingData.selected_use_case
        ? mapUseCaseToBackend(scopingData.selected_use_case)
        : undefined,
      selected_dataset: scopingData.selected_dataset
        ? mapDatasetToBackend(scopingData.selected_dataset)
        : undefined,
      infrastructure_assessment: scopingData.infrastructure_assessment,
      data_suitability: scopingData.data_suitability,
      technical_infrastructure: scopingData.technical_infrastructure,
      suitability_checks: scopingData.suitability_checks,
      active_step: scopingData.active_step,
      ready_to_proceed: scopingData.ready_to_proceed,
      reasoning: scopingData.reasoning,
    };

    const response = await api.post<ScopingApiResponse<any>>(
      `scoping/${projectId}/complete`,
      requestData
    );

    if (response.success) {
      return response;
    } else {
      throw new Error(response.message || "Failed to complete scoping phase");
    }
  },
};