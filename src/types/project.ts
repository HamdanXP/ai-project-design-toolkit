
export type ProjectPhase = {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  totalSteps: number;
  completedSteps: number;
};
