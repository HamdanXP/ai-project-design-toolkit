import { useProject } from "@/contexts/ProjectContext";
import { DataSuitabilityCheck, TechnicalInfrastructure } from "@/types/scoping-phase";

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
    selectedDataset,
    setSelectedDataset,
    suitabilityChecks,
    setSuitabilityChecks,
    scopingFinalDecision,
    setScopingFinalDecision,
    technicalInfrastructure,
    setTechnicalInfrastructure,
    infrastructureAssessment,
    setInfrastructureAssessment
  } = useProject();

  const totalSteps = 5;

  const moveToNextStep = () => {
    if (scopingActiveStep < totalSteps) {
      const nextStep = scopingActiveStep + 1;
      setScopingActiveStep(nextStep);
      
      const progress = (nextStep / totalSteps) * 100;
      updatePhaseStatus("scoping", "in-progress", Math.min(progress, 100));
    }
  };

  const moveToPreviousStep = () => {
    if (scopingActiveStep > 1) {
      const prevStep = scopingActiveStep - 1;
      setScopingActiveStep(prevStep);
      
      const progress = (prevStep / totalSteps) * 100;
      updatePhaseStatus("scoping", "in-progress", Math.max(progress, 0));
    }
  };

  const moveToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setScopingActiveStep(step);
      
      const progress = (step / totalSteps) * 100;
      updatePhaseStatus("scoping", "in-progress", progress);
    }
  };

  const resetPhase = () => {
    setScopingActiveStep(1);
    setSelectedUseCase(null);
    setSelectedDataset(null);
    setScopingFinalDecision(null);
    
    // Reset technical infrastructure to empty state
    setTechnicalInfrastructure({
      computing_resources: "",
      storage_data: "",
      internet_connectivity: "",
      deployment_environment: ""
    });
    setInfrastructureAssessment(null);
    
    // Reset suitability checks to default
    const defaultSuitabilityChecks: DataSuitabilityCheck[] = [
      { id: "data_completeness", question: "When you examine the data, what do you observe?", answer: "unknown", description: "Assess how complete and consistent your dataset appears" },
      { id: "population_representativeness", question: "Does this data fairly represent the people you want to help?", answer: "unknown", description: "Evaluate if the data covers your target communities adequately" },
      { id: "privacy_ethics", question: "Could using this data cause harm or raise privacy concerns?", answer: "unknown", description: "Consider potential risks to individuals and communities" },
      { id: "quality_sufficiency", question: "Do you have enough good quality data for your project?", answer: "unknown", description: "Assess if the data volume and quality meet your project needs" }
    ];
    setSuitabilityChecks(defaultSuitabilityChecks);
    
    updatePhaseStatus("scoping", "in-progress", 0);
  };

  const handleCompletePhase = () => {
    if (scopingFinalDecision === 'proceed') {
      updatePhaseStatus("scoping", "completed", 100);
      onCompletePhase();
    } else {
      // If not ready to proceed, reset to beginning
      setScopingActiveStep(1);
      updatePhaseStatus("scoping", "in-progress", 20);
    }
  };

  return {
    totalSteps,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep,
    resetPhase,
    handleCompletePhase
  };
};