
import { Progress } from "@/components/ui/progress";

interface ScopingHeaderProps {
  activeStep: number;
  totalSteps: number;
}

export const ScopingHeader = ({ activeStep, totalSteps }: ScopingHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">Scoping Phase</h1>
      <p className="text-muted-foreground">
        Define and validate the AI approach for your project. Explore use cases, assess feasibility, and ensure data suitability.
      </p>
      
      <div className="mt-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress value={(activeStep / totalSteps) * 100} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Step {activeStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}
