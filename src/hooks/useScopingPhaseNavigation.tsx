
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { UseCase, Dataset } from "@/types/scoping-phase";
import { useProject } from "@/contexts/ProjectContext";

type UseScopingPhaseNavigationProps = {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
  currentPhaseStatus?: "not-started" | "in-progress" | "completed";
};

export const useScopingPhaseNavigation = ({
  onUpdateProgress,
  onCompletePhase,
  updatePhaseStatus,
  currentPhaseStatus = "in-progress"
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

  // Update progress only if the phase is not already completed
  useEffect(() => {
    // Skip all automatic progress updates if the phase is already completed
    if (currentPhaseStatus === "completed") {
      console.log("Phase is completed. Skipping progress updates.");
      return;
    }
    
    // For steps 1-4, use automatic progress tracking
    if (scopingActiveStep < 5) {
      onUpdateProgress(scopingActiveStep - 1, totalSteps);
    } 
    // For step 5, only update if there's a final decision
    else if (scopingFinalDecision) {
      const progressValue = scopingFinalDecision === 'proceed' ? 100 : 80;
      updatePhaseStatus("scoping", "in-progress", progressValue);
    }
  }, [scopingActiveStep, scopingFinalDecision, currentPhaseStatus, onUpdateProgress, updatePhaseStatus, totalSteps]);

  // Handle step navigation
  const moveToNextStep = () => {
    // Don't change steps if the phase is completed
    if (currentPhaseStatus === "completed") return;
    
    if (scopingActiveStep < totalSteps) {
      setScopingActiveStep(scopingActiveStep + 1);
    }
  };
  
  const moveToPreviousStep = () => {
    // Don't change steps if the phase is completed
    if (currentPhaseStatus === "completed") return;
    
    if (scopingActiveStep > 1) {
      setScopingActiveStep(scopingActiveStep - 1);
    }
  };

  // Reset phase function
  const resetPhase = () => {
    // Only reset if not already completed
    if (currentPhaseStatus !== "completed") {
      setScopingActiveStep(1);
      onUpdateProgress(0, totalSteps);
      setSelectedUseCase(null);
      setSelectedDataset(null);
      setScopingFinalDecision(null);
    }
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
    
    // Update the status to "completed" with 100% progress
    updatePhaseStatus("scoping", "completed", 100);
    
    // Call the completion handler
    onCompletePhase();
  };

  return {
    totalSteps,
    scopingActiveStep,
    currentPhaseStatus,
    moveToNextStep,
    moveToPreviousStep,
    resetPhase,
    handleCompletePhase
  };
};
