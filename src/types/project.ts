
export type ProjectPhase = {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  totalSteps: number;
  completedSteps: number;
};

export interface EthicalConsideration {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  source_reference?: string;
  source_filename: string;
  source_bucket?: string;
  source_page?: string;
  source_excerpt?: string;
  source_updated?: string;
  source_size?: number;
  source_url?: string;
  actionable_steps: string[];
  why_important: string;
  beneficiary_impact?: string;
  acknowledged: boolean;
}