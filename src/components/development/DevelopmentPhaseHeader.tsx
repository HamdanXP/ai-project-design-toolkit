
import { Check, ArrowRight } from "lucide-react";

type DevelopmentPhaseHeaderProps = {
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
};

export const DevelopmentPhaseHeader = ({ 
  currentStep, 
  totalSteps, 
  isCompleted 
}: DevelopmentPhaseHeaderProps) => {
  // Step titles
  const stepTitles = [
    "AI Pipeline Selection",
    "Milestones Planning",
    "Development Workspace",
    "Ethical Checkpoints",
    "Model Output Review",
    "Readiness Check"
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold">Development Phase {isCompleted && <Check className="inline ml-2 text-emerald-500" />}</h2>
      </div>
      
      <div className="text-muted-foreground">
        {isCompleted ? (
          <p>You've successfully completed the Development Phase!</p>
        ) : (
          <p>Build your AI solution with responsible AI practices.</p>
        )}
      </div>
      
      <div className="flex items-center text-sm font-medium">
        <span className="font-semibold">{stepTitles[currentStep - 1]}</span>
        <ArrowRight className="inline mx-2 h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
      </div>
    </div>
  );
};
