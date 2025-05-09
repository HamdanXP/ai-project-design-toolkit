
export type PipelineType = 'classification' | 'regression' | 'forecasting' | 'clustering' | 'nlp' | 'computer-vision' | 'tabular';

export type PipelineTemplate = {
  id: string;
  name: string;
  type: PipelineType;
  description: string;
  icon: string;
};

export type EthicalGuardrail = {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  recommendation?: string;
};

export type PrototypeMilestone = {
  id: string;
  name: string;
  description: string;
  completed: boolean;
};

export type TestResult = {
  id: string;
  timestamp: string;
  inputs: string;
  outputs: string;
  notes: string;
};

export type EvaluationCriteria = {
  id: string;
  question: string;
  answer: 'yes' | 'no' | 'partially' | 'unknown';
  notes: string;
};

export type DevelopmentDecision = 'proceed' | 'iterate' | 'revisit' | null;

// New types for Evaluation Phase
export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export type RiskAssessment = {
  id: string;
  category: string;
  level: RiskLevel;
  notes: string;
};

export type StakeholderFeedback = {
  id: string;
  name: string;
  role: string;
  notes: string;
  rating: number; // 1-5 rating
};

export type ImpactGoalCheck = {
  id: string;
  question: string;
  isAligned: boolean;
  notes: string;
};

export type EvaluationDecision = 'finalise' | 'iterate' | 'reframe' | null;
