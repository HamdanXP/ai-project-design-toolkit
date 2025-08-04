export interface GuidanceSource {
  content: string;
  source_id: string;
  filename: string;
  bucket: string;
  folder: string;
  domain: string;
  source_location: string;
  page?: string;
  updated?: string;
  size?: number;
  guidance_area: string;
  domain_context: string;
}

export interface QuestionGuidanceProps {
  questionKey: string;
  guidanceSources: GuidanceSource[];
  className?: string;
}

export interface Question {
  id: string;
  text: string;
  key: string;
  guidanceSources?: GuidanceSource[];
}

export interface AlternativeSolutions {
  digital_alternatives: string[];
  process_improvements: string[];
  non_digital_solutions: string[];
  hybrid_approaches: string[];
  reasoning: string;
}

export interface EthicalReadinessAssessment {
  ethical_score: number;
  ethical_summary: string;  
  ai_appropriateness_score: number;
  ai_appropriateness_summary: string;
  ai_recommendation: 'highly_appropriate' | 'appropriate' | 'questionable' | 'not_appropriate';
  alternative_solutions?: AlternativeSolutions;
  overall_readiness_score: number;
  proceed_recommendation: boolean;
  summary: string;
  actionable_recommendations: string[];
  question_flags: Array<{
    question_key: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    category: 'ethical' | 'appropriateness'; // NEW: categorize the type of issue
  }>;
  
  threshold_met: boolean;
  can_proceed: boolean;
}

export interface EthicalAssessment extends EthicalReadinessAssessment {}