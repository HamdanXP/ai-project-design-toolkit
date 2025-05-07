
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
};

export type DataSuitabilityCheck = {
  id: string;
  question: string;
  answer: 'yes' | 'no' | 'unknown';
  description: string;
};
