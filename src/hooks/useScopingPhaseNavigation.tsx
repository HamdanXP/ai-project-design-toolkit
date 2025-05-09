
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";

type UseScopingPhaseNavigationProps = {
  onCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
};

export const useScopingPhaseNavigation = ({
  onCompletePhase,
  updatePhaseStatus
}: UseScopingPhaseNavigationProps) => {
  const { toast } = useToast();
  const totalSteps = 5;
  
  const {
    scopingActiveStep,
    setScopingActiveStep,
    selectedUseCase,
    setSelectedUseCase,
    selectedDataset,
    setSelectedDataset,
    scopingFinalDecision,
    setScopingFinalDecision
  } = useProject();

  // Handle step navigation
  const moveToNextStep = () => {
    if (scopingActiveStep < totalSteps) {
      setScopingActiveStep(scopingActiveStep + 1);
      
      // Only update progress when moving to next step
      const newProgress = Math.min(Math.round(((scopingActiveStep) / totalSteps) * 100), 80);
      updatePhaseStatus("scoping", "in-progress", newProgress);
    }
  };
  
  const moveToPreviousStep = () => {
    if (scopingActiveStep > 1) {
      setScopingActiveStep(scopingActiveStep - 1);
    }
  };

  // Reset phase function
  const resetPhase = () => {
    setScopingActiveStep(1);
    setSelectedUseCase(null);
    setSelectedDataset(null);
    setScopingFinalDecision(null);
    updatePhaseStatus("scoping", "in-progress", 0);
  };

  // Handle phase completion with validation
  const handleCompletePhase = () => {
    // Check if the user has completed the necessary steps
    if (!selectedUseCase) {
      toast({
        title: "Missing Use Case",
        description: "Please select an AI use case before completing.",
        variant: "destructive"
      });
      setScopingActiveStep(1);
      return;
    }
    
    if (!selectedDataset) {
      toast({
        title: "Missing Dataset",
        description: "Please select a dataset before completing.",
        variant: "destructive"
      });
      setScopingActiveStep(3);
      return;
    }
    
    if (scopingFinalDecision !== 'proceed') {
      toast({
        title: "Final Review Required",
        description: "Please confirm the project is ready to proceed.",
        variant: "destructive"
      });
      setScopingActiveStep(5);
      return;
    }
    
    // Update the status to "completed" with 100% progress and call the completion handler
    updatePhaseStatus("scoping", "completed", 100);
    onCompletePhase();
  };

  return {
    totalSteps,
    scopingActiveStep,
    moveToNextStep,
    moveToPreviousStep,
    resetPhase,
    handleCompletePhase
  };
};
