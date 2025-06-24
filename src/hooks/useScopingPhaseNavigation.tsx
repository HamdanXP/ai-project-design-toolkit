import { useProject } from "@/contexts/ProjectContext";
import { FeasibilityConstraint, DataSuitabilityCheck } from "@/types/scoping-phase";

interface ScopingNavigationProps {
  onCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
}

export const useScopingPhaseNavigation = ({
  onCompletePhase,
  updatePhaseStatus
}: ScopingNavigationProps) => {
  const {
    scopingActiveStep,
    setScopingActiveStep,
    selectedUseCase,
    setSelectedUseCase,
    constraints,
    setConstraints,
    selectedDataset,
    setSelectedDataset,
    suitabilityChecks,
    setSuitabilityChecks,
    scopingFinalDecision,
    setScopingFinalDecision
  } = useProject();

  const totalSteps = 5;

  const moveToNextStep = () => {
    if (scopingActiveStep < totalSteps) {
      const nextStep = scopingActiveStep + 1;
      setScopingActiveStep(nextStep);
      
      // Update progress
      const progress = (nextStep / totalSteps) * 100;
      updatePhaseStatus("scoping", "in-progress", Math.min(progress, 100));
    }
  };

  const moveToPreviousStep = () => {
    if (scopingActiveStep > 1) {
      const prevStep = scopingActiveStep - 1;
      setScopingActiveStep(prevStep);
      
      // Update progress
      const progress = (prevStep / totalSteps) * 100;
      updatePhaseStatus("scoping", "in-progress", Math.max(progress, 0));
    }
  };

  // Allow direct step navigation
  const moveToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setScopingActiveStep(step);
      
      // Update progress
      const progress = (step / totalSteps) * 100;
      updatePhaseStatus("scoping", "in-progress", progress);
    }
  };

  const resetPhase = () => {
    setScopingActiveStep(1);
    setSelectedUseCase(null);
    setSelectedDataset(null);
    setScopingFinalDecision(null);
    
    // Reset constraints to defaults
    const defaultConstraints: FeasibilityConstraint[] = [
      { id: "time", label: "Time Available", value: "medium-term", options: ["short-term", "medium-term", "long-term"], type: "select" },
      { id: "tech", label: "Technical Capacity", value: "moderate", options: ["limited", "moderate", "extensive"], type: "select" },
      { id: "compute", label: "Computing Resources", value: "cloud", options: ["local", "cloud", "hybrid"], type: "select" },
      { id: "internet", label: "Internet Access", value: true, type: "toggle" },
      { id: "infrastructure", label: "Local Infrastructure", value: true, type: "toggle" }
    ];
    setConstraints(defaultConstraints);
    
    // Reset suitability checks
    const defaultSuitabilityChecks: DataSuitabilityCheck[] = [
      { id: "completeness", question: "When you examine the data, what do you observe?", answer: "unknown", description: "Assess how complete and consistent your dataset appears" },
      { id: "representativeness", question: "Does this data fairly represent the people you want to help?", answer: "unknown", description: "Evaluate if the data covers your target communities adequately" },
      { id: "privacy", question: "Could using this data cause harm or raise privacy concerns?", answer: "unknown", description: "Consider potential risks to individuals and communities" },
      { id: "sufficiency", question: "Do you have enough good quality data for your project?", answer: "unknown", description: "Assess if the data volume and quality meet your project needs" }
    ];
    setSuitabilityChecks(defaultSuitabilityChecks);
    
    updatePhaseStatus("scoping", "in-progress", 0);
  };

  const handleCompletePhase = () => {
    if (scopingFinalDecision === 'proceed') {
      updatePhaseStatus("scoping", "completed", 100);
      onCompletePhase();
    } else {
      // If not ready to proceed, reset to earlier step for revision
      setScopingActiveStep(2); // Go back to feasibility
      updatePhaseStatus("scoping", "in-progress", 40);
    }
  };

  return {
    totalSteps,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep, // New: Allow direct step navigation
    resetPhase,
    handleCompletePhase
  };
};