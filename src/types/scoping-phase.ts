
export type UseCase = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  selected: boolean;
};

export type Dataset = {
  id: string;
  title: string;
  source: string;
  format: string;
  size: string;
  license: string;
  description: string;
  columns?: string[];
  sampleRows?: any[][];
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
  riskLevel?: 'low' | 'medium' | 'high';
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
