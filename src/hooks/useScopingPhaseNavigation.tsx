
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

  // Initialize progress based on phase status and decisions
  useEffect(() => {
    // If the phase is already completed, keep it at 100%
    if (currentPhaseStatus === "completed") {
      onUpdateProgress(totalSteps, totalSteps);
      return;
    }
    
    // Handle special case for step 5 progress
    if (scopingFinalDecision === 'proceed') {
      // If there's already a "proceed" decision, set to 100%
      // But don't change status to completed here - that's done in handleCompletePhase
      updatePhaseStatus("scoping", "in-progress", 100);
    } else if (scopingFinalDecision === 'revise') {
      // If there's already a "revise" decision, set to 80%
      updatePhaseStatus("scoping", "in-progress", 80);
    } else {
      // Default progress calculation (steps 1-4)
      const currentStep = Math.min(scopingActiveStep, 4); // Cap at 4 for progress calculation purposes
      onUpdateProgress(currentStep - 1, totalSteps);
    }
  }, [onUpdateProgress, updatePhaseStatus, scopingFinalDecision, scopingActiveStep, totalSteps, currentPhaseStatus]);

  // Only update automatic progress for steps 1-4
  // Step 5 progress is controlled by user decisions in Final Feasibility Gate
  useEffect(() => {
    if (currentPhaseStatus === "completed") {
      // If phase is completed, keep full progress
      onUpdateProgress(totalSteps, totalSteps);
    } else {
      // For steps 1-4, use automatic progress tracking
      if (scopingActiveStep < 5) {
        onUpdateProgress(scopingActiveStep - 1, totalSteps);
      }
      // For step 5, progress is controlled by FinalFeasibilityGate buttons
    }
  }, [scopingActiveStep, currentPhaseStatus, onUpdateProgress, totalSteps]);

  // Handle step navigation
  const moveToNextStep = () => {
    if (scopingActiveStep < totalSteps) {
      const nextStep = scopingActiveStep + 1;
      setScopingActiveStep(nextStep);
      
      // Always update progress when moving from step 4 to step 5
      // This ensures the sidebar shows 4/5 steps completed
      if (nextStep === 5) {
        onUpdateProgress(4, totalSteps);
      }
      // For steps 1-3, use automatic progress
      else if (nextStep < 5) {
        onUpdateProgress(nextStep - 1, totalSteps);
      }
    }
  };
  
  const moveToPreviousStep = () => {
    if (scopingActiveStep > 1) {
      const prevStep = scopingActiveStep - 1;
      setScopingActiveStep(prevStep);
      
      // If the phase is completed, don't change the progress
      if (currentPhaseStatus !== "completed") {
        // Only update automatic progress for steps 1-4
        if (prevStep < 5) {
          onUpdateProgress(prevStep - 1, totalSteps); 
        }
      }
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

  // Handle phase completion
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
    
    // First, update the status to "completed" with 100% progress
    updatePhaseStatus("scoping", "completed", 100);
    
    // Then call the phase completion handler
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
