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

export interface EthicalAssessment {
  ethical_score: number;
  proceed_recommendation: boolean;
  summary: string;
  actionable_recommendations: string[];
  question_flags: Array<{
    question_key: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  threshold_met: boolean;
  can_proceed: boolean;
}