
// Pipeline types for the AI Pipeline Selector
export type PipelineType = 
  | "classification"
  | "regression"
  | "forecasting"
  | "clustering"
  | "nlp"
  | "computer-vision"
  | "tabular"
  | "other";

// Milestone type for the Milestones Timeline
export type Milestone = {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  notes: string;
};

// Workspace type for the Workspace Launcher
export type WorkspaceType = "no-code" | "notebook" | "external";

// Ethical check type for the Ethical Checkpoints
export type EthicalCheck = {
  id: string;
  question: string;
  answer: "yes" | "no" | "unknown";
  notes: string;
};

// Model output type for the Model Output Review
export type ModelOutput = {
  performance: string | null;
  samplePredictions: string | null;
  issues: string | null;
  hasScreenshot: boolean;
  meetsImpactGoal: boolean;
};
