
import { Button } from "@/components/ui/button";

type StepNavigationProps = {
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
  currentStep: number;
  totalSteps: number;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  nextButtonLabel?: string;
};

export const StepNavigation = ({
  moveToPreviousStep,
  moveToNextStep,
  currentStep,
  totalSteps,
  isNextDisabled = false,
  isPreviousDisabled = false,
  nextButtonLabel = "Next"
}: StepNavigationProps) => {
  return (
    <div className="flex justify-between pt-4">
      <Button 
        variant="outline" 
        onClick={moveToPreviousStep} 
        disabled={isPreviousDisabled || currentStep === 1}
      >
        Previous
      </Button>
      
      <Button 
        onClick={moveToNextStep} 
        disabled={isNextDisabled || currentStep === totalSteps}
      >
        {nextButtonLabel}
      </Button>
    </div>
  );
};
